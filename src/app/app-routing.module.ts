import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StreamComponent } from './components/stream/stream.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'scope/stream/x/y' },
  { path: 'scope/stream/:scopeId/:scopeDoc', component: StreamComponent, canActivate: [AuthGuard] },
  { path: 'scopes', loadChildren: () => import('./components/auth/auth.module').then(module => module.AuthModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
