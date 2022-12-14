import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, EMPTY, from, isEmpty, map, of, race, share, switchMap, throwError} from 'rxjs';
import {environment} from '../../environments/environment';
import {StreamScopeInfo} from '../../types';

const sessionStorageScopesKey = 'SCOPES';

@Injectable({
  providedIn: 'root'
})
export class ScopeService {
  constructor(private httpClient: HttpClient) {
  }

  private fetchScopesFromApi() {
    return this.httpClient.get<StreamScopeInfo[]>(`https://${environment.apiDomain}/scopes`);
  }

  private fetchScopesFromSessionStorage() {
    return of(sessionStorage.getItem(sessionStorageScopesKey)).pipe(
      switchMap(json => {
        if (!json) return EMPTY;
        return of(JSON.parse(json) as StreamScopeInfo[]);
      }),
      catchError(() => EMPTY)
    );
  }

  loadAvailableScopes() {
    return this.fetchScopesFromApi();
  }

  joinScope(documentId: string, scopeId: string, token: string) {
    const url = `https://${environment.apiDomain}/scopes/${scopeId}/${documentId}/${token}`;
    return this.httpClient.get(url, {observe: 'response'});
  }
}
