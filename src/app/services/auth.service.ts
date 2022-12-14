import {Injectable} from '@angular/core';
import {catchError, map, Observable, of, switchMap} from 'rxjs';
import {StreamScopeInfo} from '../../types';
import {Select, Store} from '@ngxs/store';
import {ScopeState} from '../state/scope/scope.state';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentScope$!: Observable<StreamScopeInfo|undefined>;
  constructor(store: Store) {
    this.currentScope$ = store.select(ScopeState.currentScope);
  }

  get isAuthed$() {
    return this.currentScope$.pipe(
      map(scope => {
        return !!scope && scope.token != null;
      })
    )
  }
}
