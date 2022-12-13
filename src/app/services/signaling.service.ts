import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {ISignaler} from 'src/signaling';
import {IndicatorSignaler} from 'src/signaling/indicator.signaler';
import {WebSocketSignaler} from 'src/signaling/websocket.signaler';
import {StreamScopeInfo} from '../../types';

@Injectable({
  providedIn: 'root'
})
export class SignalingService {
  private readonly internalSignaler!: ISignaler;
  constructor() {
    if (!environment.production) {
      try {
        const json = sessionStorage.getItem('SCOPE');
        if (!json) {
          console.error('Scope not found!');
          alert('Scope not found');
          return;
        }
        const scope = JSON.parse(json) as StreamScopeInfo;
        this.internalSignaler = new WebSocketSignaler(scope);
      } catch (error) {
        console.error(error);
      }
    } else {
      this.internalSignaler = new IndicatorSignaler();
    }
  }
  get status$() {
    return this.internalSignaler.status$;
  };
  initialize(): void {
    this.internalSignaler.initialize();
  }
  teardown(): void {
    this.internalSignaler.teardown();
  }
  send(event: string, payload?: any): void {
    this.internalSignaler?.send(event, payload);
  }
  get signalStream$() {
    return this.internalSignaler.signalStream$;
  }
}
