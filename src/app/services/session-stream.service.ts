import {Injectable} from '@angular/core';
import {
  connectable,
  Connectable,
  filter,
  first,
  forkJoin,
  from,
  map,
  Subject,
  Subscription,
  switchMap,
  tap
} from 'rxjs';
import {StateService} from './state.service';

export type SessionTrackUpdate = { oldTrack?: MediaStreamTrack, newTrack?: MediaStreamTrack, kind: 'audio' | 'video' };
export type TrackUpdateNotification = { sessionId: string, update: SessionTrackUpdate };

const defaultVideoWidth = 640;
const defaultVideoHeight = 480;

@Injectable({providedIn: 'root'})
export class SessionStreamService {
  private readonly sessionStreamMap: { [sessionId: string]: { kind: 'audio' | 'video', track: MediaStreamTrack }[] };
  private readonly trackUpdatedChannel: Subject<TrackUpdateNotification>;
  private readonly trackUpdatedNotificationPublisher: Connectable<TrackUpdateNotification>;
  private readonly trackUpdateNotificationSubscription: Subscription;

  constructor(private readonly stateService: StateService) {
    this.sessionStreamMap = {};
    this.trackUpdatedChannel = new Subject<TrackUpdateNotification>();
    this.trackUpdatedNotificationPublisher = connectable(this.trackUpdatedChannel);
    this.trackUpdateNotificationSubscription = this.trackUpdatedNotificationPublisher.connect();
    this.listenToSessionTrackUpdates();
  }

  private listenToSessionTrackUpdates() {
    this.trackUpdatedNotificationPublisher.pipe(
      filter(({update: {oldTrack, newTrack}}) => !!newTrack)
    ).subscribe(({update: {newTrack}}) => {

    })
  }

  getLocalPublishTracks$(sessionId: string) {
    return this.stateService.state.changes.pipe(
      filter(state => !!state),
      switchMap(state => from(navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: state!.audioDevice?.id,
          echoCancellation: true,
          noiseSuppression: true
        },
        video: {
          deviceId: state!.videoDevice.id,
          width: {min: defaultVideoWidth},
          height: {min: defaultVideoHeight},
          frameRate: {min: 30},
          facingMode: {ideal: 'face'}
        }
      }))),
      switchMap(stream => forkJoin({
        audio: from(stream.getAudioTracks()).pipe(first()),
        video: from(stream.getVideoTracks()).pipe(first())
      })),
      tap(({audio, video}) => {
        this.setSessionTrack(sessionId, 'audio', audio);
        this.setSessionTrack(sessionId, 'video', video);
      })
    )
  }

  setSessionTrack(sessionId: string, kind: 'audio' | 'video', track: MediaStreamTrack) {
    let entry = this.sessionStreamMap[sessionId];
    let oldTrack: MediaStreamTrack | undefined = undefined;
    if (!entry) {
      this.sessionStreamMap[sessionId] = [{kind, track}];
    } else {
      const currentTrackEntry = entry.find(e => e.kind === kind);
      if (!currentTrackEntry) {
        entry.push({kind, track});
      } else {
        oldTrack = currentTrackEntry.track;
        currentTrackEntry.track = track;
      }
    }
    this.trackUpdatedChannel.next({sessionId, update: {kind, oldTrack, newTrack: track}});
  }

  removeSessionTrack(sessionId: string, kind: 'audio' | 'video') {
    const entry = this.sessionStreamMap[sessionId];
    if (!entry) return;
    const trackEntry = entry.find(x => x.kind === kind);
    if (!trackEntry) return;

    if (trackEntry.track.readyState != 'ended') {
      trackEntry.track.stop();
    }

    this.trackUpdatedChannel.next({sessionId, update: {kind, oldTrack: trackEntry.track, newTrack: undefined}});
    this.sessionStreamMap[sessionId] = entry.filter(x => x.kind !== kind);
  }

  watchSessionTrackChanges(sessionId: string) {
    return this.trackUpdatedNotificationPublisher.pipe(
      filter(notification => notification.sessionId === sessionId),
      map(({update}) => update)
    );
  }

  getSessionTrack(sessionId: string, kind: 'audio' | 'video') {
    const entry = this.sessionStreamMap[sessionId];
    if (!entry) return undefined;
    const trackEntry = entry.find(e => e.kind === kind);
    return trackEntry?.track;
  }

  getSessionStream(sessionId: string) {
    const mapEntry = this.sessionStreamMap[sessionId];
    if (!mapEntry) return undefined;
    return new MediaStream(mapEntry.map(e => e.track)
      .reduce((acc, e) => [...acc, e], Array<MediaStreamTrack>()));
  }
}
