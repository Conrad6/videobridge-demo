import { BehaviorSubject, Connectable, connectable, Observable, Subject, Subscription } from "rxjs";
import { Signal } from "./signal.type";
import { ConnectionStatus, ISignaler } from "./signaler.interface";
import {StreamScopeInfo} from '../types';

export abstract class AbstractSignaler implements ISignaler {
  protected signalChannel: Subject<Signal<any>>;
  private signalPublisher: Connectable<Signal<any>>;
  private signalSubscription: Subscription;
  private statusChannel: BehaviorSubject<ConnectionStatus>;

  protected constructor() {
    this.signalChannel = new Subject<Signal<any>>();
    this.signalPublisher = connectable(this.signalChannel);
    this.signalSubscription = this.signalPublisher.connect();
    this.statusChannel = new BehaviorSubject<ConnectionStatus>('idle');
  }

  protected set status(status: ConnectionStatus) {
    this.statusChannel.next(status);
  }

  get status$() {
    return this.statusChannel.asObservable();
  }

  abstract send(event: string, payload?: any): void;

  get signalStream$() {
    return this.signalPublisher;
  }

  teardown() {
    this.signalSubscription.unsubscribe();
  }

  initialize(scope: StreamScopeInfo): void {
  }
}
