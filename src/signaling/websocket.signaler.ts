import {environment} from "src/environments/environment";
import {AbstractSignaler} from "./abstract.signaler";
import {Signal} from "./signal.type";
import {timer} from 'rxjs';
import {StreamScopeInfo} from '../types';

export class WebSocketSignaler extends AbstractSignaler {

  private connection?: WebSocket;
  private retryCount = 0;
  private retryDelay = 3_000;
  private retryLimit = 500;
  private connectCount = 0;
  private failCount = 0;
  constructor(private scope: StreamScopeInfo) {
    super();
  }

  override initialize(): void {
    this.status = this.failCount > 0 ? 'retrying' : 'connecting';
    const url = `ws${environment.secured ? 's' : ''}://${environment.apiDomain}${environment.socketPath}?scopeId=${this.scope.id}&scopeDoc=${this.scope.documentId}&token=${this.scope.token}`;
    this.connection = new WebSocket(url);
    this.connection.onerror = () => {
      console.error(`Failed to connect to ${url}`)
      this.status = 'connectionFailed';
    };

    this.connection.onclose = event => {
      if (event.code != 1000) {
        this.failCount++;
        this.status = 'waiting...';
        if (this.retryCount >= this.retryLimit) {
          this.status = "tooManyRetries";
          return;
        }
        this.retryCount++;
        timer(this.retryCount * this.retryDelay).subscribe(() => this.initialize());
        return;
      }
      this.status = 'disconnected';
    }

    this.connection.onopen = () => {
      this.status = 'connected';
      this.retryCount = 0;
      this.connectCount++;
    }

    this.connection.onmessage = event => {
      try {
        const signal = JSON.parse(event.data as string) as Signal;
        this.signalChannel.next(signal);
      } catch (error) {
        console.error(error);
      }
    }
  }

  override send(event: string, payload?: any): void {
    if(!this.connection) return;
    const msg = {event, data: payload};
    this.connection.send(JSON.stringify(msg));
  }
}
