import {Injectable} from '@angular/core';
import {StreamScopeInfo} from '../../../types';
import {StateLoadingStatus} from '../state-loading-status';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {ScopeService} from '../../services/scope.service';
import {Scope} from './scope.actions';
import {
  catchError,
  combineLatestWith,
  EMPTY,
  from,
  isEmpty,
  map,
  mergeMap,
  share,
  switchMap,
  tap,
  throwError
} from 'rxjs';
import JoinAttempted = Scope.JoinAttempted;

const defaultState: StreamScopeInfo[] = [];
export type ScopeJoinStatus = 'joining' | 'joined' | 'joinFailed';
export type ScopeStateStatus = StateLoadingStatus | ScopeJoinStatus;

export interface ScopeStateModel {
  status: ScopeStateStatus,
  scopes: StreamScopeInfo[],
  joinedScope?: StreamScopeInfo,
  error?: string
}

@Injectable()
@State<ScopeStateModel>({
  name: 'scopes',
  defaults: {status: 'pending', scopes: [], joinedScope: undefined}
})
export class ScopeState {
  @Selector()
  static currentScope(state: any) {
    return state.joinedScope;
  }

  @Selector()
  static availableScopes(state: any) {
    return state.scopes;
  }

  constructor(private scopeService: ScopeService) {
  }

  @Action(Scope.LoadAvailable)
  onLoadAvailableScopes(context: StateContext<ScopeStateModel>) {
    context.patchState({status: 'loading'});
    return this.scopeService.loadAvailableScopes().pipe(
      tap(scopes => {
        context.patchState({scopes});
        context.dispatch(new Scope.AvailableLoaded('success', undefined, scopes));
      }),
      catchError((error: Error) => {
        context.dispatch(new Scope.AvailableLoaded('failure', error.message));
        console.error(error);
        return EMPTY;
      })
    );
  }

  @Action(Scope.AvailableLoaded)
  onAvailableScopesLoaded(context: StateContext<ScopeStateModel>, {status, error, scopes}: Scope.AvailableLoaded) {
    context.patchState({error, status: status == 'failure' ? 'failed' : 'loaded', scopes: scopes ?? []});
  }

  @Action(Scope.JoinAttempted)
  onJoinAttempted(context: StateContext<ScopeStateModel>, {status, error, scope}: Scope.JoinAttempted) {
    context.patchState({status: status == 'failure' ? 'joinFailed' : 'joined', error});
    if (status == 'failure') {
      context.patchState({status: "joinFailed", error});
      return;
    }
    context.patchState({status: 'joined', error: undefined, joinedScope: scope});
    console.log(context.getState());
  }

  @Action(Scope.AttemptJoin)
  onAttemptJoin(context: StateContext<ScopeStateModel>, {scopeId, token, documentId}: Scope.AttemptJoin) {
    context.patchState({status: 'joining'});
    return this.scopeService.joinScope(documentId, scopeId, token).pipe(tap(
        response => {
          if (response && response.status == 200) {
            const scope = context.getState().scopes.find(scope => scope.id === scopeId);
            context.dispatch(new JoinAttempted('success', undefined, {...scope!, token}));
          }
        }),
      catchError((error: Error) => {
        context.dispatch(new JoinAttempted('failure', error.message));
        return throwError(() => error);
      })
    );
  }

}
