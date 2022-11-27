import { Injectable } from '@angular/core';
import { catchError, of, switchMap } from 'rxjs';
import { StreamScopeInfo } from '../components/auth/scopes/scopes.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {
  }

  get isAuthed$() {
    return of(sessionStorage.getItem('SCOPE')).pipe(
      switchMap(val => {
        if (!val) return of(false);
        const scope = JSON.parse(val) as StreamScopeInfo;
        return of(scope.token != null);
      }),
      catchError(() => of(false))
    )
  }
}
