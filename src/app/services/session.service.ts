import {Injectable} from '@angular/core';
import {SignalingService} from './signaling.service';
import * as mediasoup from 'mediasoup-client';
import {
  AsyncSubject,
  catchError,
  EMPTY,
  filter,
  from,
  map,
  merge,
  Observable,
  of,
  switchMap,
  take,
  tap,
  throwError
} from 'rxjs';
import {eventNames, SessionParameters, SimulcastOptions, TransportParameters} from '../../types';
import {Store} from '@ngxs/store';
import {Sessions} from '../state/sessions/session.actions';
import Device = Sessions.Session.Device;
import Transport = Sessions.Session.Transport;
import Producer = Sessions.Session.Producer;
import ParametersReceived = Sessions.Session.Internal.ParametersReceived;
import RemoteStarted = Sessions.Session.Producer.RemoteStarted;
import RemoteStopped = Sessions.Session.Producer.RemoteStopped;
import ServerSideCreated = Sessions.Session.Consumer.ServerSideCreated;
import Ended = Sessions.Session.Internal.Ended;

@Injectable({providedIn: 'root'})
export class SessionService {
  constructor(private readonly signalingService: SignalingService,
              private readonly store: Store) {
    this.handleRemoteSignals();
  }

  private handleRemoteSignals() {
    this.handleSessionParametersSignals();
    this.handleRemoteProducerUpdateSignals();
    this.handleRemoteConsumerUpdateSignals();
  }

  private handleRemoteConsumerUpdateSignals() {
    // Handle remote consumer creation.
    this.signalingService.signalStream$?.pipe(
      filter(({event}) => event === eventNames.consumerCreated),
      map(({data: {id, kind, producerId, sessionId, rtpParameters}}) => ({
        id: id as string,
        type: kind as 'audio' | 'video',
        producerId: producerId as string,
        sessionId: sessionId as string,
        rtpParameters: rtpParameters as mediasoup.types.RtpParameters
      }))
    ).subscribe(parameters => {
      this.store.dispatch(new ServerSideCreated(
        parameters.sessionId,
        parameters.id,
        parameters.producerId,
        parameters.type,
        parameters.rtpParameters
      ));
    });
  }

  private handleRemoteProducerUpdateSignals() {
    // Handle remote producer creation.
    this.signalingService.signalStream$?.pipe(
      filter(({event}) => event === eventNames.newRemoteProducer),
      map(({data: {producerId, sessionId}}) => ({
        producerId: producerId as string,
        sessionId: sessionId as string
      }))
    ).subscribe(({producerId, sessionId}) => {
      this.store.dispatch(new RemoteStarted(sessionId, producerId));
    });

    // Handle remote producer closure.
    this.signalingService.signalStream$?.pipe(
      filter(({event}) => event === eventNames.remoteProducerClosed),
      map(({data: {sessionId, kind}}) => ({sessionId: sessionId as string, kind: kind as 'audio' | 'video'}))
    ).subscribe(({sessionId, kind}) => {
      this.store.dispatch(new RemoteStopped(sessionId, kind));
    });
  }

  private handleSessionParametersSignals() {
    // Handle Parameters for publish Session.
    const localSessionStream$ = this.signalingService.signalStream$?.pipe(
      filter(({event}) => event === eventNames.publishParams),
      map(({data}) => ({...data, isLocal: true}) as SessionParameters),
    );

    // Handler Parameters for subscribed Sessions.
    const remoteSessionStream$ = this.signalingService.signalStream$?.pipe(
      filter(({event}) => event === eventNames.consumeParams),
      map(({data}) => ({...data, isLocal: false}) as SessionParameters)
    );

    merge(localSessionStream$, remoteSessionStream$).subscribe(parameters => {
      this.store.dispatch(new ParametersReceived(parameters));
    });

    this.signalingService.signalStream$.pipe(
      filter(({event}) => event === eventNames.remoteSessionEnd),
      map(({data}) => (data as { sessionId: string }))
    ).subscribe(({sessionId}) => {
      this.store.dispatch(new Ended(sessionId));
    });
  }

  startSession(sessionParameters: SessionParameters) {
    const subject = new AsyncSubject<void>();

    this.createDevice(sessionParameters.sessionId).pipe(
      switchMap(device => {
        return this.loadDevice(sessionParameters.sessionId, device, sessionParameters.deviceParameters.rtpCapabilities).pipe(
          switchMap(() => this.createTransport(sessionParameters.sessionId, device, sessionParameters.isLocal ? 'send' : 'recv', sessionParameters.deviceParameters.transportParameters))
        )
      })
    ).subscribe({
      next: () => subject.next(),
      error: (error: Error) => subject.error(error),
      complete: () => subject.complete()
    });

    return subject.asObservable();
  }

  private createTransport(sessionId: string, device: mediasoup.types.Device, type: 'send' | 'recv', transportParameters: TransportParameters) {
    let transportStream$: Observable<mediasoup.types.Transport>;
    if (type == 'send') transportStream$ = of(device.createSendTransport(transportParameters));
    else transportStream$ = of(device.createRecvTransport(transportParameters))

    return transportStream$.pipe(
      tap((transport) => this.store.dispatch(new Transport.Created('succeeded', undefined, sessionId, transport))),
      tap(transport => this.handleTransportEvents(sessionId, transport)),
      catchError((error) => {
        this.store.dispatch(new Transport.Created('failed', error.message, sessionId, undefined));
        return throwError(() => error);
      })
    );
  }

  private handleTransportEvents(sessionId: string, transport: mediasoup.types.Transport) {

    transport.on('connectionstatechange', (newState: mediasoup.types.ConnectionState) => {
      if (newState == 'connected')
        this.store.dispatch(new Transport.Connected(sessionId));
      else if (newState == 'closed')
        this.store.dispatch(new Transport.Closed('succeeded', undefined, sessionId));
    });

    transport.on('connect', ({dtlsParameters}, callback, errBack) => {
      try {
        this.signalingService.send(eventNames.transportConnect, {transportId: transport.id, dtlsParameters});
        callback();
      } catch (error) {
        console.error(error);
        errBack(error as Error);
      }
    });

    if (transport.direction != 'recv') return;
    transport.on('produce', ({kind, rtpParameters}, callback, errBack) => {
      this.signalingService.signalStream$?.pipe(
        filter(({event}) => event == eventNames.producerCreated),
        take(1)
      ).subscribe({
        next: ({data: {producerId, sessionId}}) => {
          callback({id: producerId});
          this.store.dispatch(new Producer.ServerSideCreated(sessionId, producerId));
        },
        error: (error: Error) => {
          console.error(error);
          errBack(error);
        }
      });
      this.signalingService.send(eventNames.createProducer, {sessionId, kind, rtpParameters});
    });
  }

  private createDevice(sessionId: string) {
    return EMPTY.pipe(
      switchMap(() => of(new mediasoup.types.Device)),
      tap(device => {
        this.store.dispatch(new Device.Created('succeeded', undefined, sessionId, device));
      })
    );
  }

  private loadDevice(sessionId: string, device: mediasoup.types.Device, rtpCapabilities: mediasoup.types.RtpCapabilities) {
    return from(device.load({routerRtpCapabilities: rtpCapabilities})).pipe(
      tap(() => this.store.dispatch(new Device.Loaded('succeeded', undefined, sessionId))),
      catchError((error: Error) => {
        this.store.dispatch(new Device.Loaded('failed', error.message, sessionId));
        return EMPTY;
      })
    );
  }

  private _createProducer(transport: mediasoup.types.Transport,
                          track: MediaStreamTrack,
                          simulcastOptions?: SimulcastOptions) {
    const options = {...(simulcastOptions || {}), track};
    return from(transport.produce(options));
  }

  createProducer(sessionId: string, track: MediaStreamTrack, transport?: mediasoup.types.Transport, simulcastOptions?: SimulcastOptions) {
    return of(track).pipe(
      switchMap(_track => {
        if (!transport) return throwError(() => new Error(`Transport required to create producer!`));
        return this._createProducer(transport, track, simulcastOptions);
      })
    );
  }

  createConsumer(transport: mediasoup.types.Transport, type: 'audio' | 'video', consumerId: string, producerId: string, rtpParameters: mediasoup.types.RtpParameters) {
    return from(transport.consume({
      id: consumerId,
      kind: type,
      producerId,
      rtpParameters
    }))
  }

  pauseRemoteConsumer(sessionId: string, consumerId: string) {
    this.signalingService.send(eventNames.pauseConsumer, {sessionId, consumerId});
  }

  resumeRemoteConsumer(sessionId: string, consumerId: string) {
    this.signalingService.send(eventNames.resumeConsumer, {sessionId, consumerId})
  }
}
