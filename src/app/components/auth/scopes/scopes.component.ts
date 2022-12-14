import {Component, OnInit} from '@angular/core';
import {StreamScopeInfo} from '../../../../types';
import {Select, Store} from '@ngxs/store';
import {Scope} from '../../../state/scope/scope.actions';
import LoadAvailable = Scope.LoadAvailable;
import AttemptJoin = Scope.AttemptJoin;
import {Observable} from 'rxjs';
import {ScopeState} from '../../../state/scope/scope.state';
import {Router} from '@angular/router';

@Component({
  selector: 'app-scopes',
  templateUrl: './scopes.component.html',
  styleUrls: ['./scopes.component.scss']
})
export class ScopesComponent implements OnInit {

  @Select(ScopeState.availableScopes) scopes$!: Observable<StreamScopeInfo[]>;

  constructor(private readonly store: Store,
              private readonly router: Router) {
  }

  ngOnInit(): void {
    this.store.dispatch(new LoadAvailable());
  }

  selectScope(scope: StreamScopeInfo)  {
    this.router.navigateByUrl(this.router.createUrlTree([scope.documentId, scope.id]));
  }
}
