import {Injectable} from '@angular/core';
import {StreamScopeInfo} from '../../../types';
import {StateLoadingStatus} from '../state-loading-status';
import {Action, State, StateContext} from '@ngxs/store';
import {ScopeService} from '../../services/scope.service';
import {Scope} from './scope.actions';
import {catchError, combineLatestWith, EMPTY, from, isEmpty, mergeMap, share, switchMap, tap} from 'rxjs';
import JoinAttempted = Scope.JoinAttempted;

const defaultState: StreamScopeInfo[] = [];
export type ScopeJoinStatus = 'joining' | 'joined' | 'joinFailed';
export type ScopeStateStatus = StateLoadingStatus | ScopeJoinStatus;

export interface ScopeStateModel {
  status: ScopeStateStatus,
  scopes: StreamScopeInfo[],
  error?: string
}

@Injectable()
@State<ScopeStateModel>({
  name: 'scopes',
  defaults: {status: 'pending', scopes: defaultState}
})
export class ScopeState {
  constructor(private scopeService: ScopeService) {
  }

  @Action(Scope.LoadAvailable)
  onLoadAvailableScopes(context: StateContext<ScopeStateModel>) {
    context.patchState({status: 'loading'});
    const availableScopes$ = this.scopeService.loadAvailableScopes()
      .pipe(share());
    return EMPTY.pipe(
      mergeMap(() => availableScopes$.pipe(isEmpty(), combineLatestWith(availableScopes$))),
      switchMap(([isEmpty, availableScopes]) => {
        if (isEmpty || availableScopes.length == 0) return EMPTY;
        context.patchState({scopes: availableScopes});
        context.dispatch(new Scope.AvailableLoaded('success', undefined));
        return from(availableScopes);
      }),
      catchError((error: Error) => context.dispatch(new Scope.AvailableLoaded('failure', error.message)))
    );
  }

  @Action(Scope.AvailableLoaded)
  onAvailableScopesLoaded(context: StateContext<ScopeStateModel>, {status, error}: Scope.AvailableLoaded) {
    context.patchState({error, status: status == 'failure' ? 'failed' : 'loaded'});
  }

  @Action(Scope.JoinAttempted)
  onJoinAttempted(context: StateContext<ScopeStateModel>, {status, error}: Scope.JoinAttempted) {
    context.patchState({status: status == 'failure' ? 'joinFailed' : 'joined', error});
  }

  @Action(Scope.AttemptJoin)
  onAttemptJoin(context: StateContext<ScopeStateModel>, {scopeId, token, documentId}: Scope.AttemptJoin){
    context.patchState({status: 'joining'});
    this.scopeService.joinScope(documentId, scopeId, token).pipe(
      tap(joined => {
        if(joined) {
          context.dispatch(new JoinAttempted('success', undefined));
        }
      }),
      catchError((error: Error) => {
        context.dispatch(new JoinAttempted('failure', error.message));
        return EMPTY;
      })
    );
  }

}
