import * as mediasoup from 'mediasoup-client';
import {Injectable} from '@angular/core';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {Sessions} from './session.actions';
import {SessionParameters} from '../../../types';
import {SessionService} from '../../services/session.service';
import {catchError, EMPTY, fromEvent, tap} from 'rxjs';
import ParametersReceived = Sessions.Session.Internal.ParametersReceived;
import Device = Sessions.Session.Device;
import Transport = Sessions.Session.Transport;
import Producer = Sessions.Session.Producer;
import Consumer = Sessions.Session.Consumer;

interface Session {
  device?: mediasoup.types.Device;
  transport?: mediasoup.types.Transport;
  producerIds: string[];
}

export type SessionModel = SessionParameters & Session;

export interface RemoteSessionModel extends SessionModel {
  consumers: mediasoup.types.Consumer[];
}

export interface LocalSessionModel extends SessionModel {
  producers: mediasoup.types.Producer[];
}

export interface SessionStateModel {
  status: 'pending' | 'joining' | 'ended' | 'joined' | 'joinFailed';
  error?: string;
  session: SessionModel;
}

export interface SessionsStateModel {
  sessions: SessionStateModel[];
}

@Injectable()
@State<SessionsStateModel>({
  name: 'sessions',
  defaults: {sessions: Array<SessionStateModel>()}
})
export class SessionState {
  constructor(private readonly sessionService: SessionService) {
  }

  @Selector()
  static allSessions(state: SessionsStateModel) {
    return state.sessions.map(sessionModel => sessionModel.session);
  }

  @Selector()
  static findById(id: string) {
    return (state: SessionsStateModel) => state.sessions.find(session => session.session.sessionId === id)
  }

  @Action(ParametersReceived)
  onParametersReceived(context: StateContext<SessionsStateModel>, {parameters}: ParametersReceived) {
    let sessionModel: SessionModel;
    if (parameters.isLocal) sessionModel = {producerIds: [], producers: [], ...parameters} as LocalSessionModel;
    else sessionModel = {producerIds: [], consumers: [], ...parameters} as RemoteSessionModel;
    const state = context.getState();
    context.patchState({sessions: [...state.sessions, {status: 'pending', session: sessionModel}]});
    this.sessionService.startSession(parameters);
  }

  private getSession(state: SessionsStateModel, sessionId?: string) {
    if (!sessionId) return;
    return SessionState.findById(sessionId)(state);
  }


  @Action(Device.Created)
  onDeviceCreated(context: StateContext<SessionsStateModel>, {status, error, sessionId, device}: Device.Created) {
    const state = context.getState();
    const sessionState = this.getSession(state, sessionId);
    if (!sessionState) return;
    if (status == 'failed' || !sessionId || !device) {
      sessionState.status = 'joinFailed';
      sessionState.error = error;
      state.sessions = state.sessions.filter(({session}) => session.sessionId != sessionId);
      state.sessions = [...state.sessions, sessionState];
      context.setState(state);
      return;
    }
    sessionState.session.device = device;
    context.setState(state);
  }


  @Action(Device.Loaded)
  onDeviceLoaded(context: StateContext<SessionsStateModel>, {sessionId, error, status}: Device.Loaded) {
    const state = context.getState();
    const sessionState = this.getSession(state, sessionId);
    if (!sessionState) return;
    if (status == 'failed' || !sessionId) {
      sessionState.status = 'joinFailed';
      sessionState.error = error;
      state.sessions = state.sessions.filter(({session}) => session.sessionId != sessionId);
      state.sessions = [...state.sessions, sessionState];
      context.setState(state);
      return;
    }

    sessionState.status = 'joining';
    state.sessions = state.sessions.filter(({session}) => session.sessionId != sessionId);
    state.sessions = [...state.sessions, sessionState];
    context.setState(state);
  }

  @Action(Transport.Created)
  onTransportCreated(context: StateContext<SessionsStateModel>, {
    sessionId,
    transport,
    status,
    error
  }: Transport.Created) {
    const state = context.getState();
    const sessionState = this.getSession(state, sessionId);
    if (!sessionState) return;
    if (status == 'failed' || !sessionId) {
      sessionState.status = 'joinFailed';
      sessionState.error = error;
      state.sessions = state.sessions.filter(({session}) => session.sessionId != sessionId);
      state.sessions = [...state.sessions, sessionState];
      context.setState(state);
      return;
    }
    sessionState.session.transport = transport;
    state.sessions = state.sessions.filter(({session}) => session.sessionId != sessionId);
    state.sessions = [...state.sessions, sessionState];
    context.setState(state);
  }

  @Action(Producer.Create)
  onCreateProducer(context: StateContext<SessionsStateModel>, {
    sessionId,
    track,
    type
  }: Producer.Create) {
    const state = context.getState();
    const sessionState = this.getSession(state, sessionId);
    if (!sessionState || !sessionId || !type) return EMPTY;
    const transport = sessionState.session.transport;
    return this.sessionService.createProducer(sessionId,
      track,
      transport,
      type == 'video' ? sessionState.session.media?.video?.simulcast : undefined).pipe(
      tap(producer => context.dispatch(new Producer.Created('succeeded', undefined, sessionId, type, producer))),
      tap(producer => fromEvent(producer.observer, 'pause').subscribe(() => context.dispatch(new Producer.Paused(sessionId, type)))),
      tap(producer => fromEvent(producer.observer, 'resume').subscribe(() => context.dispatch(new Producer.Resumed(sessionId, type)))),
      tap(producer => fromEvent(producer.observer, 'close').subscribe(() => context.dispatch(new Producer.Stopped(sessionId, type)))),
      catchError((error: Error) => {
        context.dispatch(new Producer.Created('failed', error.message, sessionId, type, undefined));
        return EMPTY;
      })
    );
  }

  @Action(Producer.Created)
  onProducerCreated(context: StateContext<SessionsStateModel>, {
    sessionId,
    producer,
    type,
    status,
    error
  }: Producer.Created) {
    const state = context.getState();
    const sessionState = this.getSession(state, sessionId);
    if (!sessionState || !sessionId || !type) return;

    if (status == 'failed') {
      sessionState.error = error;
    } else {
      sessionState.error = undefined;
      const localSession = sessionState.session as LocalSessionModel;
      localSession.producers = [...localSession.producers, producer as mediasoup.types.Producer];
    }

    state.sessions = state.sessions.filter(({session}) => session.sessionId != sessionId);
    state.sessions = [...state.sessions, sessionState];
    context.setState(state);
  }

  @Action(Producer.Pause)
  onPauseProducer(context: StateContext<SessionsStateModel>, {
    type,
    sessionId
  }: Producer.Pause) {
    const state = context.getState();
    const sessionState = this.getSession(state, sessionId);
    if (!sessionState) return;
    const localSession = sessionState.session as LocalSessionModel;
    const producer = localSession.producers.find(producer => producer.kind == type);
    if (!producer || producer.paused) return;
    producer.pause();
  }

  @Action(Producer.Resume)
  onResumeProducer(context: StateContext<SessionsStateModel>, {
    sessionId,
    type
  }: Producer.Resume) {
    const state = context.getState();
    const sessionState = this.getSession(state, sessionId);
    if (!sessionState) return;
    const localSession = sessionState.session as LocalSessionModel;
    const producer = localSession.producers.find(producer => producer.kind == type);
    if (!producer || !producer.paused) return;
    producer.resume();
  }

  @Action(Producer.Stop)
  onStopProducer(context: StateContext<SessionsStateModel>, {
    sessionId,
    type
  }: Producer.Stop) {
    const state = context.getState();
    const sessionState = this.getSession(state, sessionId);
    if (!sessionState) return;
    const localSession = sessionState.session as LocalSessionModel;
    const producer = localSession.producers.find(producer => producer.kind == type);
    if (!producer) return;
    producer.close();
  }

  @Action(Consumer.ServerSideCreated)
  onServerSideProduceCreated(context: StateContext<SessionsStateModel>, {
    sessionId,
    producerId,
    type,
    rtpParameters,
    consumerId
  }: Consumer.ServerSideCreated) {
    const state = context.getState();
    const sessionState = this.getSession(state, sessionId);
    if (!sessionState || !consumerId) return;
    const transport = sessionState.session.transport;
    if (!transport) return;
    this.sessionService.createConsumer(transport,
      type,
      consumerId,
      producerId,
      rtpParameters).subscribe({
      next: consumer => {
        fromEvent(consumer.observer, 'close').subscribe(() => {
          context.dispatch(new Consumer.Stopped('succeeded', undefined, sessionId, consumerId));
        });
        fromEvent(consumer.observer, 'pause').subscribe(() => {
          context.dispatch(new Consumer.Paused(sessionId as string, consumerId));
        });
        fromEvent(consumer.observer, 'resume').subscribe(() => {
          context.dispatch(new Consumer.Resumed(sessionId as string, consumerId));
        });
        fromEvent(consumer.observer, 'trackended').subscribe(() => {
          console.log('Track ended');
          context.dispatch(new Consumer.Stop(sessionId, consumer));
        });

        const remoteSession = sessionState.session as RemoteSessionModel;
        remoteSession.consumers = [...remoteSession.consumers, consumer];

        state.sessions = state.sessions.filter(({session}) => session.sessionId != sessionId);
        state.sessions = [...state.sessions, sessionState];
        context.setState(state);
        context.dispatch(new Consumer.Created('succeeded', undefined, sessionId, consumer));
      },
      error: (error: Error) => {
        context.dispatch(new Consumer.Created('failed', error.message, sessionId, undefined));
      }
    });
  }

  @Action(Consumer.Pause)
  onPauseConsumer(context: StateContext<SessionsStateModel>, {
    sessionId,
    consumerId
  }: Consumer.Pause) {
    const state = context.getState();
    const sessionState = this.getSession(state, sessionId);
    if (!sessionState || !consumerId) return;
    const remoteSession = sessionState.session as RemoteSessionModel;
    const consumer = remoteSession.consumers.find(consumer => consumer.id == consumerId);
    if(!consumer) return;
    if(consumer.paused) return;
    this.sessionService.pauseRemoteConsumer(sessionId, consumerId);
    consumer.pause();
  }

  @Action(Consumer.Resume)
  onResumeConsumer(context: StateContext<SessionsStateModel>, {
    sessionId,
    consumerId
  }: Consumer.Resume){
    const state = context.getState();
    const sessionState = this.getSession(state, sessionId);
    if (!sessionState || !consumerId) return;
    const remoteSession = sessionState.session as RemoteSessionModel;
    const consumer = remoteSession.consumers.find(consumer => consumer.id == consumerId);
    if(!consumer) return;
    this.sessionService.resumeRemoteConsumer(sessionId, consumerId);
    consumer?.resume();
  }

  @Action(Consumer.Created)
  onLocalConsumerCreated(context: StateContext<SessionsStateModel>, action: Consumer.Created) {
    if(action.status == 'failed') return;
    context.dispatch(new Consumer.Resume(action.sessionId as string, action.consumerId as string));
  }
}
