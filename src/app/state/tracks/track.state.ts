import {Action, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {Track} from './track.actions';
import {StreamService} from '../../services/stream.service';
import {catchError, EMPTY, tap, throwError} from 'rxjs';
import {NoSelectedDeviceError} from '../../errors/NoSelectedDeviceError';
import {Sessions} from '../sessions/session.actions';
import {Device} from '../devices/device.actions';
import NoSelection = Device.NoSelection;

export interface TrackStateModel {
  status: 'creating' | 'stopped' | 'live' | 'failed';
  sessionId: string;
  error?: string;
  track?: MediaStreamTrack;
  type?: 'audio' | 'video';
}

export interface TracksStateModel {
  tracks: TrackStateModel[];
}

@State<TracksStateModel>({
  name: 'tracks',
  defaults: {tracks: []}
})
@Injectable()
export class TrackState {
  constructor(private readonly streamService: StreamService) {
  }

  @Action(Track.CreateLocal)
  onCreateTrack(context: StateContext<TracksStateModel>,
                {type, sessionId}: Track.CreateLocal) {
    const state = context.getState();
    context.patchState({tracks: [...state.tracks, {sessionId, type, status: 'creating'}]});
    return this.streamService.createLocalTrack(type).pipe(
      tap(track => {
        context.dispatch(new Track.LocalCreated('succeeded', sessionId, undefined, type, track));
      }),
      catchError((error: Error) => {
        if (error instanceof NoSelectedDeviceError) {
          context.dispatch(new NoSelection(type));
        }
        context.dispatch(new Track.LocalCreated('failed', sessionId, error.message, type, undefined));
        return throwError(() => error);
      })
    );
  }

  @Action(Track.LocalCreated)
  onLocalTrackCreated(context: StateContext<TracksStateModel>,
                      {
                        track,
                        sessionId,
                        type,
                        status,
                        error
                      }: Track.LocalCreated) {
    const state = context.getState();
    const trackState = state.tracks.find(state => state.sessionId === sessionId);
    if (!trackState) {
      console.warn(`${type?.toUpperCase()} track not found for session: ${sessionId}`);
      return EMPTY;
    }

    trackState.status = status == 'failed' ? 'failed' : 'live';
    trackState.error = error;
    trackState.track = track;

    context.patchState({tracks: [...state.tracks.splice(state.tracks.indexOf(trackState), 1), trackState]});
    return EMPTY;
  }
}
