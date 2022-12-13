import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ComponentsModule} from './components/components.module';
import {HttpClientModule} from '@angular/common/http';
import {NgxsModule} from '@ngxs/store';
import {DevicesState} from './state/devices/devices.state';
import {ScopeState} from './state/scope/scope.state';
import {SessionState} from './state/sessions/session.state';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ComponentsModule,
    HttpClientModule,
    NgxsModule.forRoot([
      DevicesState,
      ScopeState,
      SessionState
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
