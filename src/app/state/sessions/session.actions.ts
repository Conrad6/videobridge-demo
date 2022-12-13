import * as mediasoup from 'mediasoup-client';
import {SessionParameters} from '../../../types';

export namespace Sessions {
  export namespace Session {
    export namespace Internal {
      abstract class Base {
        constructor(public sessionId?: string) {
        }
      }

      abstract class AfterEffect extends Base {
        constructor(status: 'succeeded' | 'failed', error?: string, sessionId?: string) {
          super(sessionId);
        }
      }

      export class ParametersReceived {
        static readonly type = '[Sessions][Session] Parameters Received';

        constructor(public parameters: SessionParameters) {
        }
      }

      export class Ended extends Base {
        static readonly type = '[Sessions][Session] Ended';
      }
    }

    export namespace Device {
      abstract class Base {
        constructor(public sessionId?: string) {
        }
      }

      export class Created extends Base {
        static readonly type = '[Session][Device] Created';

        constructor(public status: 'failed' | 'succeeded',
                    public error?: string,
                    sessionId?: string,
                    public device?: mediasoup.types.Device) {
          super(sessionId);
        }
      }

      export class Loaded extends Base {
        static readonly type = '[Session][Device] Loaded';

        constructor(public status: 'succeeded' | 'failed', public error?: string, sessionId?: string) {
          super(sessionId);
        }
      }

      export class Dispose extends Base {
        static readonly type = '[Session][Device] Dispose';
      }

      export class Disposed extends Base {
        static readonly type = '[Session][Device] Disposed';

        constructor(public status: 'succeeded' | 'failed', public error?: string, sessionId?: string) {
          super(sessionId);
        }
      }
    }

    export namespace Transport {
      abstract class Base {
        constructor(public sessionId?: string) {
        }
      }

      abstract class AfterEffect extends Base {
        constructor(public status: 'succeeded' | 'failed', public error?: string, sessionId?: string) {
          super(sessionId);
        }
      }

      export class Created extends AfterEffect {
        static readonly type = '[Session][Transport] Created';

        constructor(status: 'succeeded' | 'failed', error?: string, sessionId?: string, public transport?: mediasoup.types.Transport) {
          super(status, error, sessionId);
        }
      }

      export class Close extends Base {
        static readonly type = '[Session][Transport] Close';
      }

      export class Connected extends Base {
        static readonly type = '[Session][Transport] Connected';
      }

      export class Closed extends AfterEffect {
        static readonly type = '[Session][Transport] Closed';
      }

      export class Find {
        static readonly type = '[Session][Transport] Find';

        constructor(public sessionId?: string) {
        }
      }
    }

    export namespace Producer {
      abstract class Local {
        constructor(public sessionId?: string, public type?: 'audio' | 'video') {
        }
      }

      export class FindById {
        static type = '[Session][Producer] Find by ID';

        constructor(public producerId: string, public sessionId: string) {
        }
      }

      export class FindAll {
        static readonly type = '[Session][Producer] Find All';

        constructor(public sessionId: string) {
        }
      }

      export class Create extends Local {
        static readonly type = '[Session][Producer] Create';

        constructor(sessionId: string, type: 'audio' | 'video', public track: MediaStreamTrack) {
          super(sessionId, type);
        }
      }

      export class Created extends Local {
        static readonly type = '[Session][Producer] Created';

        constructor(public status: 'failed' | 'succeeded',
                    public error?: string,
                    sessionId?: string,
                    type?: 'audio' | 'video',
                    public producer?: mediasoup.types.Producer) {
          super(sessionId, type);
        }
      }

      export class Pause {
        static readonly type = '[Session][Producer] Pause';

        constructor(public sessionId: string, public type: 'audio' | 'video') {
        }
      }

      export class Paused {
        static readonly type = '[Session][Producer] Paused';

        constructor(public sessionId: string, public type: 'audio' | 'video') {
        }
      }

      export class Resume {
        static readonly type = '[Session][Producer] Resume';

        constructor(public sessionId: string, public type: 'audio' | 'video') {
        }
      }

      export class Resumed {
        static readonly type = '[Session][Producer] Paused';

        constructor(public sessionId: string, public type: 'audio' | 'video') {
        }
      }

      export class Stop {
        static readonly type = '[Session][Producer] Stop';

        constructor(public sessionId: string, public type: 'audio' | 'video') {
        }
      }

      export class Stopped {
        static readonly type = '[Session][Producer] Stopped';

        constructor(public sessionId: string, public type: 'audio' | 'video') {
        }
      }

      abstract class Remote {
        constructor(public sessionId: string, public producerId: string) {
        }
      }

      export class RemoteStarted extends Remote {
        static readonly type = '[Session][Producer] Remote Started';
      }

      export class RemoteStopped {
        static readonly type = '[Session][Producer] Remote Stopped';

        constructor(public sessionId: string, public type: 'audio' | 'video') {
        }
      }

      export class ServerSideCreated {
        static readonly type = '[Session][Producer] Server-side Created';

        constructor(public sessionId: string, public producerId: string) {
        }
      }
    }

    export namespace Consumer {

      abstract class Base {
        constructor(public sessionId?: string, public consumer?: mediasoup.types.Consumer) {
        }
      }

      abstract class AfterEffect {
        constructor(public status: 'succeeded' | 'failed',
                    public error?: string,
                    public sessionId?: string,
                    public consumerId?: string,
                    public consumer?: mediasoup.types.Consumer) {
        }
      }

      export class ServerSideCreated extends Base {
        static readonly type = '[Session][Consumer]'

        constructor(sessionId: string,
                    public consumerId: string,
                    public producerId: string,
                    public type: 'audio' | 'video',
                    public rtpParameters: mediasoup.types.RtpParameters) {
          super(sessionId, undefined);
        }
      }

      export class Created extends AfterEffect {
        static readonly type = '[Session][Consumer] Created';

        constructor(status: 'succeeded' | 'failed',
                    error?: string,
                    sessionId?: string,
                    public override consumer?: mediasoup.types.Consumer,) {
          super(status, error, sessionId, consumer?.id);
        }
      }

      export class Pause {
        static readonly type = '[Session][Consumer] Pause';

        constructor(public sessionId: string,
                    public consumerId: string) {
        }
      }

      export class Paused {
        static readonly type = '[Session][Consumer] Paused';

        constructor(public sessionId: string, public consumerId: string) {
        }
      }

      export class Stop extends Base {
        static readonly type = '[Session][Consumer] Stop';

      }

      export class Resume {
        static readonly type = '[Session][Consumer] Resume';

        constructor(public sessionId: string,
                    public consumerId: string) {
        }
      }

      export class Resumed {
        static readonly type = '[Session][Consumer] Resumed';

        constructor(public sessionId: string, public consumerId: string) {
        }
      }

      export class Stopped {
        static readonly type = '[Session][Consumer] Stopped';

        constructor(public status: 'succeeded' | 'failed',
                    public error?: string,
                    public sessionId?: string,
                    public consumerId?: string) {
        }
      }
    }
  }

}
