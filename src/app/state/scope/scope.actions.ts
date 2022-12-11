export namespace Scope {
  export class LoadAvailable {
    static readonly type = '[Scope] Load Available Scopes';
  }

  export class AvailableLoaded {
    static readonly type = '[Scope] Available scopes loaded';

    constructor(public status: 'failure' | 'success', public error?: string) {
    }
  }

  export class AttemptJoin {
    static readonly type = '[Scope] Attempting to Join Scope';
    constructor(public documentId: string, public token: string, public scopeId: string) {
    }
  }

  export class JoinAttempted {
    static readonly type = '[Scope] Joining Scope attempted';
    constructor(public status: 'failure' | 'success', public error?: string) {
    }
  }
}
