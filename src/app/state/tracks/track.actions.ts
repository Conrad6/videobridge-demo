export namespace Track {
  export class CreateLocal {
    static readonly type = '[Track] Create Local';

    constructor(public sessionId: string, public type: 'audio' | 'video') {
    }
  }

  export class LocalCreated {
    static readonly type = '[Track] Local Created';

    constructor(public status: 'succeeded' | 'failed',
                public sessionId: string,
                public error?: string,
                public type?: 'audio' | 'video',
                public track?: MediaStreamTrack) {
    }
  }

  export class LocalStopped {
    static readonly type = '[Track] Local Stopped';

    constructor(public sessionId: string,
                public type: 'audio' | 'video') {
    }
  }

  export class RemoteCreated {
    static readonly type = '[Track] Remote Created';

    constructor(
      public sessionId: string,
      public type: 'audio' | 'video',
      public track: MediaStreamTrack) {
    }
  }

  export class RemoteStopped {
    static readonly type = '[Track] remote Stopped';

    constructor(
      public sessionId: string,
      public type: 'audio' | 'video') {
    }
  }
}
