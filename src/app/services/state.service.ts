import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, of, switchMap, tap } from 'rxjs';
import { State } from 'src/types/streaming-device';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import { MediaDeviceService } from './media-device.service';

const generateUniqueName = () => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: ' ',
    style: 'capital'
  });
}

const localStorageStateKey = 'STATE';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private readonly stateSubject: BehaviorSubject<State | undefined>;

  constructor(private deviceService: MediaDeviceService) {
    this.stateSubject = new BehaviorSubject<State | undefined>(undefined);
    this.loadStateFromStorage().subscribe(state => this.stateSubject.next(state));
  }

  get state() {
    return {
      snapshot: this.stateSubject.getValue(),
      // changes: this.defaultState$
      changes: this.stateSubject.asObservable()
    }
  }

  private get defaultState$() {
    return this.deviceService.devices$.pipe(
      map(devices => ({
        audioDevice: devices.audio.in[0],
        displayName: generateUniqueName(),
        videoDevice: devices.video.in[0]
      }) as State)
    )
  }

  updateState(state: State) {
    this.stateSubject.next(state);
    this.saveState(state);
  }

  private saveState(state: State) {
    localStorage.setItem(localStorageStateKey, JSON.stringify(state));
  }

  private loadStateFromStorage() {
    const json = localStorage.getItem(localStorageStateKey);
    if (!json) {
      return this.defaultState$.pipe(
        tap(state => this.saveState(state))
      );
    }
    return of(json).pipe(
      map(json => JSON.parse(json) as State)
    );
  }
}
