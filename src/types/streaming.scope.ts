export interface StreamScopeInfo {
  documentId: string;
  id: string;
  name: string;
  isOnline: boolean;
  connectedMembers: number;
  token?: string;
}
