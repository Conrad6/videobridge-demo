import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})
export class StreamComponent {
  rightPanelCollapsed = false;
  bottomPanelCollapsed = false;
  @ViewChild('settings') settings?: SettingsComponent;

  showingSettings() {
    if (!this.settings) return;
    this.settings.showSettings();
  }

}
