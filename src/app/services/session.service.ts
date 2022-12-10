import {Injectable} from '@angular/core';
import {SignalingService} from './signaling.service';
import {eventNames} from '../../types/eventNames';
import {
  BehaviorSubject,
  combineLatestWith,
  connectable,
  Connectable,
  EMPTY,
  filter,
  first,
  forkJoin,
  from,
  fromEvent,
  map, Observable,
  of,
  switchMap,
  take,
  tap, zip
} from 'rxjs';
import {SessionParameters, TransportParameters} from '../../types/session-parameters';
import * as mediasoup from 'mediasoup-client';
import {SessionStreamService} from './session-stream.service';
import {AuthService} from './auth.service';

@Injectable({providedIn: 'root'})
export class SessionService {
  private readonly sessionSubject: BehaviorSubject<SessionParameters[]>;
  private readonly sessionPublisher: Connectable<SessionParameters[]>;
  private readonly sessionDeviceMap: { [sessionId: string]: mediasoup.types.Device };
  private readonly sessionTransportMap: { [sessionId: string]: mediasoup.types.Transport };
  private readonly sessionProducerMap: {
    [sessionId: string]: {
      audio?: { id?: string, producer?: mediasoup.types.Producer },
      video?: { id?: string, producer?: mediasoup.types.Producer }
    }
  };
  private readonly sessionConsumerMap: {
    [sessionId: string]: {
      audio?: { id?: string, consumer?: mediasoup.types.Consumer },
      video?: { id?: string, consumer?: mediasoup.types.Consumer }
    }
  };

  constructor(private readonly authService: AuthService,
              private readonly signalingService: SignalingService,
              private readonly sessionStreamService: SessionStreamService) {
    this.sessionSubject = new BehaviorSubject<SessionParameters[]>([]);
    this.sessionPublisher = connectable(this.sessionSubject);
    this.sessionPublisher.connect();
    this.sessionDeviceMap = {};
    this.sessionTransportMap = {};
    this.sessionProducerMap = {};
    this.sessionConsumerMap = {};
    this.signalingService.status$.pipe(
      filter(status => status == 'connected'),
      take(1)
    ).subscribe(() => {
      this.setupEventHandlers();
    });
  }

  get allSessions$(): Observable<SessionParameters> {
    return this.sessionPublisher.pipe(
      switchMap(sessions => from(sessions))
    );
  }

  private getLocalSessionProducer(kind: mediasoup.types.MediaKind) {
    return this.allSessions$.pipe(
      filter(session => session.isLocal),
      first(),
      switchMap(session => of(this.sessionProducerMap[session.sessionId]).pipe(
        map(m => kind == 'audio' ? m.audio : m.video),
        map(m => m?.producer),
        combineLatestWith(of(session))
      ))
    )
  }

  stopLocalSessionProducer(kind: mediasoup.types.MediaKind) {
    this.getLocalSessionProducer(kind).pipe(
      filter(([producer]) => !!producer)
    ).subscribe(([producer]) => {
      producer?.close();
    });
  }

  pauseLocalSessionProducer(kind: mediasoup.types.MediaKind) {
    this.allSessions$.pipe(
      filter(session => session.isLocal),
      first(),
      switchMap(session => of(this.sessionProducerMap[session.sessionId]).pipe(
          map(m => kind == 'audio' ? m.audio : m.video),
          map(m => m?.producer),
          combineLatestWith(of(session))
        )
      )
    ).subscribe(([producer]) => {
      producer?.pause();
    });
  }

  private addSession(sessionParams: SessionParameters) {
    const temp = this.sessionSubject.getValue();
    temp.push(sessionParams);
    this.sessionSubject.next(temp);
  }

  private removeSession(sessionId: string) {
    const temp = this.sessionSubject.getValue();
    this.sessionSubject.next(temp.filter(x => x.sessionId !== sessionId));
  }

  private createSessionConsumer(sessionId: string, consumerParameters: mediasoup.types.ConsumerOptions) {
    const transport = this.sessionTransportMap[sessionId];
    return from(transport.consume(consumerParameters)).pipe(
      tap(consumer => {
        let entry = this.sessionConsumerMap[sessionId];
        const map = {id: consumer.id, consumer};
        if (!entry) {
          entry = {};
          if (consumer.kind == 'audio')
            entry.audio = map;
          if (consumer.kind == 'video')
            entry.video = map;
          return;
        }
        if (consumer.kind == 'audio')
          entry.audio = map;
        if (consumer.kind == 'video')
          entry.video = map;

        fromEvent(consumer.observer, 'close').subscribe(() => {
          const entry = this.sessionConsumerMap[sessionId];
          if (!entry) return;
          if (consumer.kind == 'audio')
            this.sessionConsumerMap[sessionId].audio = undefined;
          if (consumer.kind == 'video')
            this.sessionConsumerMap[sessionId].video = undefined;
          this.sessionStreamService.removeSessionTrack(sessionId, consumer.kind);
        });
        this.sessionStreamService.setSessionTrack(sessionId, consumer.kind, consumer.track);
      })
    )
  }

  private handleServerConsumerCreatedEvent() {
    this.signalingService.signalStream$.pipe(
      filter(({event}) => event === eventNames.createConsumer),
      switchMap(({data: {sessionId, consumerParameters}}) => {
        return this.createSessionConsumer(sessionId, consumerParameters);
      })
    ).subscribe((consumer) => {
      console.log(`Consumer::${consumer.id} created`);
    })
  }

  private handleRemoteProducerCreatedEvent() {
    this.signalingService.signalStream$.pipe(
      filter(({event}) => event === eventNames.remoteProducer),
    ).subscribe(({data: {producerId, sessionId}}) => {
      const rtpCapabilities = this.sessionDeviceMap[sessionId]?.rtpCapabilities;
      if (!rtpCapabilities) {
        console.error(`Cannot request for server-side consumer to be created. Reason: No device found for session${sessionId}`);
        return;
      }
      this.signalingService.send(eventNames.createConsumer, {sessionId, producerId, rtpCapabilities});
    })
  }

  private handleLocalSessionEvent() {
    this.signalingService.signalStream$.pipe(
      filter(({event}) => event === eventNames.publishParams),
      map(({data: params}) => params as SessionParameters)
    ).subscribe(params => {
      this.addSession({...params, isLocal: true});
      this.startLocalPublishSession(params);
    });
  }

  private handleRemoteSessionEvent() {
    this.signalingService.signalStream$.pipe(
      filter(({event}) => event === eventNames.consumeParams),
      map(({data: params}) => params as SessionParameters)
    ).subscribe(params => {
      this.addSession({...params, isLocal: false});
      this.startRemoteSession(params);
    });
  }

  private createSessionProducer(sessionId: string,
                                transport: mediasoup.types.Transport,
                                track: MediaStreamTrack, options?: any) {
    if (transport.direction == 'recv') {
      console.warn('Invalid transport type for producer');
      return EMPTY;
    }
    return from(transport.produce({...(options || {}), track})).pipe(
      tap(producer => {
        const entry = this.sessionProducerMap[sessionId];
        entry.audio = {...(entry.audio || {}), producer};
        entry.video = {...(entry.video || {}), producer};
        fromEvent(producer.observer, 'close').subscribe(() => {
          console.log(`Producer::${producer.id} closed`);
          this.sessionStreamService.removeSessionTrack(sessionId, producer.kind);
          if (producer.kind == 'video') {
            entry.video = undefined;
            if (!entry.audio) {
              delete this.sessionProducerMap[sessionId];
            }
          } else {
            entry.audio = undefined;
            if (!entry.video) {
              delete this.sessionProducerMap[sessionId];
            }
          }
        });
        console.log(`New Producer::${producer.id} created`);
      })
    )
  }

  private startLocalPublishSession(params: SessionParameters) {
    this.createDevice(params.sessionId, params.deviceParameters.rtpCapabilities).pipe(
      switchMap(device => {
        return this.createSendTransport(params.sessionId, params.deviceParameters.transportParameters, device).pipe(
          switchMap(transport => this.sessionStreamService.getLocalPublishTracks$(params.sessionId).pipe(combineLatestWith(of(transport)))),
          switchMap(([{audio, video}, transport]) => {
            return zip(
              this.createSessionProducer(params.sessionId, transport, audio),
              this.createSessionProducer(params.sessionId, transport, video, params.media?.video?.simulcast)
            );
          })
        );
      })
    ).subscribe(([videoProducer]) => {
      console.log(`Session::${params.sessionId} producers created. Video::${videoProducer.id}`);
    });
  }

  private startRemoteSession(params: SessionParameters) {
    this.createDevice(params.sessionId, params.deviceParameters.rtpCapabilities).pipe(
      switchMap(device => this.createReceiveTransport(params.sessionId, params.deviceParameters.transportParameters, device)),
    ).subscribe(() => {
      const consumableAudioProducerId = params.consumableProducers?.audio;
      const consumableVideoProducerId = params.consumableProducers?.video;
      if (consumableAudioProducerId != null && consumableAudioProducerId != '')
        this.signalingService.send(eventNames.createConsumer, {
          sessionId: params.sessionId,
          producerId: consumableAudioProducerId
        });
      if (consumableVideoProducerId != null && consumableVideoProducerId != '')
        this.signalingService.send(eventNames.createConsumer, {
          sessionId: params.sessionId,
          producerId: consumableVideoProducerId
        });
      console.log(`Remote session::${params.sessionId} started by ${params.displayName}`);
    });
  }

  private createReceiveTransport(_sessionId: string, parameters: TransportParameters, device: mediasoup.types.Device) {
    return of(device).pipe(
      switchMap(device => {
        const transport = device.createRecvTransport(parameters);
        this.handleTransportDefaultEvents(_sessionId, transport);
        return of(transport);
      })
    )
  }

  private handleTransportDefaultEvents(sessionId: string, transport: mediasoup.types.Transport) {
    this.sessionTransportMap[sessionId] = transport;
    transport.on('connect', ({dtlsParameters}, callback, errBack) => {
      try {
        this.signalingService.send(eventNames.transportConnect, {transportId: transport.id, dtlsParameters});
        callback();
      } catch (e) {
        errBack(e as Error);
        console.error(e);
      }
    });
    fromEvent(transport.observer, 'close').subscribe(() => {
      console.log(`Transport::${transport.id} closed`);
      delete this.sessionTransportMap[sessionId];
    });
  }

  private createSendTransport(_sessionId: string, parameters: TransportParameters, device: mediasoup.types.Device) {
    return of(device).pipe(
      switchMap(device => {
        const transport = device.createSendTransport(parameters);
        this.handleTransportDefaultEvents(_sessionId, transport);
        transport.on('produce', ({kind, rtpParameters}, callback, errBack) => {
          this.signalingService.signalStream$.pipe(
            filter(({event}) => event === eventNames.createProducer),
            filter(({data: {sessionId}}) => sessionId === _sessionId)
          ).subscribe({
            next: ({data: {producerId}}) => {
              callback({id: producerId});
              const entry = this.sessionProducerMap[_sessionId];
              if (kind == 'audio') {
                this.sessionProducerMap[_sessionId] = {
                  ...(entry || {}),
                  audio: {...(entry?.audio || {}), id: producerId}
                };
              } else {
                this.sessionProducerMap[_sessionId] = {
                  ...(entry || {}),
                  video: {...(entry?.video || {}), id: producerId}
                };
              }
            },
            error: (error: Error) => {
              errBack(error);
            }
          });
          this.signalingService.send(eventNames.createProducer, {sessionId: _sessionId, kind, rtpParameters});
        });
        return of(transport);
      }),
    )
  }

  private createDevice(sessionId: string, rtpCapabilities: mediasoup.types.RtpCapabilities) {
    return of(new mediasoup.types.Device()).pipe(
      switchMap(device => from(device.load({routerRtpCapabilities: rtpCapabilities})).pipe(
        map(() => device)
      )),
      tap(device => this.sessionDeviceMap[sessionId] = device)
    );
  }

  private setupEventHandlers() {
    this.handleLocalSessionEvent();
    this.handleRemoteSessionEvent();
    this.handleRemoteSessionClosedEvent();
    this.handleRemoteProducerClosedEvent();
    this.handleRemoteProducerCreatedEvent();
    this.handleServerConsumerCreatedEvent();
  }

  private handleRemoteProducerClosedEvent() {
    this.signalingService.signalStream$.pipe(
      filter(({event}) => event === eventNames.producerClosed),
      switchMap(({data: {sessionId, kind}}) => {
        return EMPTY.pipe(
          map(() => {
            if (kind === 'audio')
              return this.sessionConsumerMap[sessionId]?.audio;
            else return this.sessionConsumerMap[sessionId]?.video;
          }),
          filter(map => !!map),
          filter(map => !!map!.consumer),
          filter(map => map!.consumer!.kind === kind)
        )
      })
    ).subscribe((map) => {
      map?.consumer?.close();
    });
  }

  private closeSessionConsumer(sessionId: string, kind: 'audio' | 'video') {
    const entry = this.sessionConsumerMap[sessionId];
    if (!entry) return;
    if (kind == 'audio')
      entry.audio?.consumer?.close();
    if (kind == 'video')
      entry.video?.consumer?.close();
  }

  private closeSessionTransport(sessionId: string) {
    const transport = this.sessionTransportMap[sessionId];
    transport?.close();
  }

  private handleRemoteSessionClosedEvent() {
    this.signalingService.signalStream$.pipe(
      filter(signal => signal.event === eventNames.remoteSessionEnd)
    ).subscribe(({data: sessionId}) => {
      this.closeSessionConsumer(sessionId, 'audio');
      this.closeSessionConsumer(sessionId, 'video');
      this.closeSessionTransport(sessionId);
      this.removeSession(sessionId);
    });
  }
}
