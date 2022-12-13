import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {environment} from 'src/environments/environment';
import {StreamScopeInfo} from '../../../../types';

@Component({
  selector: 'app-scopes',
  templateUrl: './scopes.component.html',
  styleUrls: ['./scopes.component.scss']
})
export class ScopesComponent implements OnInit {
  scopes: BehaviorSubject<StreamScopeInfo[]>;

  constructor(private readonly httpClient: HttpClient,
              private readonly router: Router) {
    this.scopes = new BehaviorSubject<StreamScopeInfo[]>([]);
  }

  ngOnInit(): void {
    const cachedScopeJson = sessionStorage.getItem('SCOPE');
    if (cachedScopeJson != null && cachedScopeJson != '') {
      const scope = JSON.parse(cachedScopeJson);
      this.selectScope(scope);
      return;
    }
    this.httpClient.get<StreamScopeInfo[]>(`http${environment.secured ? 's' : ''}://${environment.apiDomain}/scopes/`).subscribe(scopes => {
      this.scopes.next(scopes);
    });
  }

  selectScope(scope: StreamScopeInfo)  {
    sessionStorage.setItem('SCOPE', JSON.stringify(scope));
    this.router.navigateByUrl(this.router.createUrlTree([scope.id]));
  }
}
