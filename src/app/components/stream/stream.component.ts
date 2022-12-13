import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {filter} from 'rxjs';
import {SignalingService} from 'src/app/services/signaling.service';
import {SettingsComponent} from '../settings/settings.component';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})
export class StreamComponent implements OnDestroy, OnInit {
  rightPanelCollapsed = false;
  bottomPanelCollapsed = false;
  @ViewChild('settings') settings?: SettingsComponent;

  constructor(private readonly signalingService: SignalingService,
              private readonly authService: AuthService) {
  }

  get connectionStatus$() {
    return this.signalingService.status$;
  }

  get currentScope$() {
    return this.authService.currentScope$;
  }

  ngOnInit(): void {
    this.signalingService.initialize();
  }

  ngOnDestroy(): void {
    this.signalingService.teardown();
  }

  showingSettings() {
    if (!this.settings) return;
  }

}
