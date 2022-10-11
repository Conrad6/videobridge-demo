import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlButtonsComponent } from './control-buttons/control-buttons.component';
import { ConferenceInfoComponent } from './conference-info/conference-info.component';
import { BridgeInfoComponent } from './bridge-info/bridge-info.component';
import { SettingsComponent } from './settings/settings.component';
import { SessionsComponent } from './sessions/sessions.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ControlButtonsComponent,
    ConferenceInfoComponent,
    BridgeInfoComponent,
    SettingsComponent,
    SessionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [SessionsComponent, ControlButtonsComponent, BridgeInfoComponent, ConferenceInfoComponent, SettingsComponent]
})
export class ComponentsModule { }
