export namespace Device {
  export class LoadByType {
    static readonly type = '[Devices] Load Devices By Type';
    constructor(public deviceType: 'audio' | 'video') {
    }
  }

  export class LoadAll{
    static readonly type = '[Devices] Load All Devices';
  }

  export class Loaded{
    static readonly type = '[Devices] Devices loaded';
    constructor(public status: 'success' | 'failure', public error?: string) {
    }
  }
}
