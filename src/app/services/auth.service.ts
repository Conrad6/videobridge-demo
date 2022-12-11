import {Injectable} from '@angular/core';
import {catchError, map, Observable, of, switchMap} from 'rxjs';
import {StreamScopeInfo} from '../../types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {
  }

  get currentScope$(): Observable<StreamScopeInfo | null> {
    return of(sessionStorage.getItem('SCOPE')).pipe(
      switchMap(val => {
        if (!val) return of(null);
        const scope = JSON.parse(val) as StreamScopeInfo;
        return of(scope);
      }),
      catchError(() => of(null))
    )
  }

  get isAuthed$() {
    return this.currentScope$.pipe(
      map(scope => !!scope && scope.token != null)
    )
  }
}
