import { Component, ViewChild } from '@angular/core';
import { SettingsComponent } from './components/settings/settings.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  rightPanelCollapsed = false;
  bottomPanelCollapsed = false;
  @ViewChild('settings') settings: SettingsComponent | undefined;

  showingSettings() {
    if (!this.settings) return;
    this.settings.showSettings();
  }
}
