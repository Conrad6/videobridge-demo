import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { BridgeInfoComponent } from './bridge-info/bridge-info.component';
import { ConferenceInfoComponent } from './conference-info/conference-info.component';
import { ControlButtonsComponent } from './control-buttons/control-buttons.component';
import { SessionsComponent } from './sessions/sessions.component';
import { SettingsComponent } from './settings/settings.component';
import { ScopesComponent } from './auth/scopes/scopes.component';
import { ScopeJoinComponent } from './auth/scope-join/scope-join.component';
import { StreamComponent } from './stream/stream.component';
import { AuthModule } from './auth/auth.module';
import { SessionComponent } from './sessions/session/session.component';
import { InitialAvatarComponent } from './initial-avatar/initial-avatar.component';


@NgModule({
  declarations: [
    ControlButtonsComponent,
    ConferenceInfoComponent,
    BridgeInfoComponent,
    SettingsComponent,
    SessionsComponent,
    StreamComponent,
    SessionComponent,
    InitialAvatarComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AuthModule
  ],
  exports: [StreamComponent, ScopesComponent, ScopeJoinComponent, AuthComponent, SessionsComponent, ControlButtonsComponent, BridgeInfoComponent, ConferenceInfoComponent, SettingsComponent]
})
export class ComponentsModule { }
