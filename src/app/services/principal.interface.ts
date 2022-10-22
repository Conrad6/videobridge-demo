export interface IPrincipal {
  displayName: string;
  scopes: {
    [scopeId: string]: {
      authToken: string;
      scopeDocument: string;
      permissions: string;
    }
  }
}
