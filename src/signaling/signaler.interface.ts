import { Observable } from "rxjs";
import { Signal } from "./signal.type";

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'idle' | 'connectionFailed' | 'waiting...' |'retrying'| 'tooManyRetries';

export interface ISignaler {
  send(event: string, payload?: any): void;
  status$: Observable<ConnectionStatus>;
  signalStream$: Observable<Signal>;
  initialize(): void;
  teardown(): void;
}
