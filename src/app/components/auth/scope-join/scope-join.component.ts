import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, take, switchMap } from 'rxjs';
import { IPrincipal } from 'src/app/services/principal.interface';
import { environment } from 'src/environments/environment';
import { StreamScopeInfo } from '../scopes/scopes.component';

@Component({
  selector: 'app-scope-join',
  templateUrl: './scope-join.component.html',
  styleUrls: ['./scope-join.component.scss']
})
export class ScopeJoinComponent implements OnInit {
  readonly selectedScope: BehaviorSubject<StreamScopeInfo>;
  errorMessage?: string;
  token?: string;
  constructor(private router: Router, private httpClient: HttpClient) {
    this.selectedScope = new BehaviorSubject(JSON.parse(sessionStorage.getItem('SCOPE') || '{}'));
  }

  ngOnInit(): void {
  }

  joinScope() {
    this.selectedScope.pipe(
      take(1),
      switchMap(scope => {
        return this.httpClient.options<IPrincipal>(`http${environment.secured ? 's' : ''}://${environment.apiDomain}/scopes/${scope.id}/${this.token}`)
      })
    )
  }

}
