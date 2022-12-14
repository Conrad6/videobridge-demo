import {Component, OnInit} from '@angular/core';
import {Store} from '@ngxs/store';
import {Scope} from '../../../state/scope/scope.actions';
import AttemptJoin = Scope.AttemptJoin;
import {ActivatedRoute, Router} from '@angular/router';
import {from, switchMap} from 'rxjs';

@Component({
  selector: 'app-scope-join',
  templateUrl: './scope-join.component.html',
  styleUrls: ['./scope-join.component.scss']
})
export class ScopeJoinComponent implements OnInit {
  token?: string;
  errorMessage?: string;
  private postId: string;
  private docId: string;

  constructor(private readonly store: Store,
              private readonly activeRoute: ActivatedRoute,
              private router: Router) {
    this.postId = activeRoute.snapshot.params['postId'];
    this.docId = activeRoute.snapshot.params['docId'];
  }

  get tokenIsValid() {
    return /^[a-zA-Z0-9]+$/gm.test(this.token ?? '')
  }

  ngOnInit(): void {
  }

  joinScope() {
    this.store.dispatch(new AttemptJoin(this.docId, this.token!, this.postId))
      .pipe(switchMap(() => from(this.router.navigateByUrl(`/scope/stream/${this.postId}/${this.docId}`))))
      .subscribe({
      next: () => {
      },
      error: (error: Error) => {
        console.error(error);
      }
    });
  }
}
