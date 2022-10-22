import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlButtonsComponent } from './control-buttons/control-buttons.component';
import { ConferenceInfoComponent } from './conference-info/conference-info.component';
import { BridgeInfoComponent } from './bridge-info/bridge-info.component';
import { SettingsComponent } from './settings/settings.component';
import { SessionsComponent } from './sessions/sessions.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';


@NgModule({
  declarations: [
    ControlButtonsComponent,
    ConferenceInfoComponent,
    BridgeInfoComponent,
    SettingsComponent,
    SessionsComponent,
    AuthComponent,
    LoginComponent,
    SignUpComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [AuthComponent, LoginComponent, SignUpComponent,
    SessionsComponent, ControlButtonsComponent, BridgeInfoComponent, ConferenceInfoComponent, SettingsComponent]
})
export class ComponentsModule { }
