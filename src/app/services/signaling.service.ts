import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {ISignaler} from 'src/signaling';
import {IndicatorSignaler} from 'src/signaling/indicator.signaler';
import {WebSocketSignaler} from 'src/signaling/websocket.signaler';
import {StreamScopeInfo} from '../../types';
import {Select} from '@ngxs/store';
import {ScopeState} from '../state/scope/scope.state';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalingService {
  private internalSignaler!: ISignaler;
  @Select(ScopeState.currentScope) currentScope$!: Observable<StreamScopeInfo>;
  constructor() {
    this.internalSignaler = new WebSocketSignaler();
  }

  get status$() {
    return this.internalSignaler.status$;
  };
  initialize(): void {
    this.currentScope$.subscribe(scope => {
      this.internalSignaler.initialize(scope);
    })
  }
  teardown(): void {
    this.internalSignaler?.teardown();
  }
  send(event: string, payload?: any): void {
    this.internalSignaler?.send(event, payload);
  }
  get signalStream$() {
    return this.internalSignaler?.signalStream$;
  }
}
