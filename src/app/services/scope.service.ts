import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, EMPTY, isEmpty, of, share, switchMap, throwError} from 'rxjs';
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
    const url = `https://${environment.apiDomain}/scopes`;
    return this.httpClient.get<StreamScopeInfo[]>(url).pipe(
      catchError(error => {
        console.error(error);
        return EMPTY;
      })
    );
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
    const storageStream$ = this.fetchScopesFromSessionStorage().pipe(share());
    const apiStream$ = this.fetchScopesFromApi();
    return storageStream$.pipe(
      isEmpty(),
      switchMap(isEmpty => {
        if (isEmpty) return apiStream$;
        return storageStream$;
      })
    );
  }

  joinScope(documentId: string, scopeId: string, token: string) {
    const url = `https://${environment.apiDomain}/${scopeId}/${documentId}/${token}`;
    return this.httpClient.get(url, {observe: 'response'}).pipe(
      switchMap(response => {
        if (response.status == 200) {
          return of(true);
        } return throwError(() => new Error(`${response.statusText || response.status}`));
      })
    );
  }
}
