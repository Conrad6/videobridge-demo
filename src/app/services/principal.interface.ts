export interface IPrincipal {
  displayName: string;
  targetScope: {
    documentId: string;
    postId: string;
  }
}
