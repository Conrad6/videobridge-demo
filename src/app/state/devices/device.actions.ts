export namespace Device {
  export class NoSelection {
    static readonly type = '[Devices] No Selection';

    constructor(public type: 'audio' | 'video') {
    }
  }

  export class LoadByType {
    static readonly type = '[Devices] Load Devices By Type';

    constructor(public deviceType: 'audio' | 'video') {
    }
  }

  export class LoadAll {
    static readonly type = '[Devices] Load All Devices';
  }

  export class Loaded {
    static readonly type = '[Devices] Devices loaded';

    constructor(public status: 'success' | 'failure', public error?: string) {
    }
  }

  export class Select {
    static readonly type = '[Devices] Select';

    constructor(public deviceId: string, public type: 'audio' | 'video') {
    }
  }

  export class SelectionChanged {
    static readonly type = '[Devices] Selection Changed';

    constructor(public type: 'audio' | 'video',
                public oldId?: string,
                public newId?: string) {
    }
  }
}
