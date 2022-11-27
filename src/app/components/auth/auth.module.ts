import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScopesComponent } from './scopes/scopes.component';
import { ScopeJoinComponent } from './scope-join/scope-join.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';

const routes: Routes = [
  { path: ':id', component: ScopeJoinComponent },
  { path: '', pathMatch: 'full', component: ScopesComponent },
]

@NgModule({
  declarations: [AuthComponent, ScopesComponent, ScopeJoinComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [AuthComponent, ScopesComponent, ScopeJoinComponent]
})
export class AuthModule { }
