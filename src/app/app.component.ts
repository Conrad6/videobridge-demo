import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AuthComponent } from './components/auth/auth.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('auth') auth?: AuthComponent;
  constructor(readonly authService: AuthService) { }
  ngAfterViewInit(): void {
    this.authService.isAuthed$.subscribe(principal => {
      if (!principal) {
        this.auth?.show();
      } else {
        this.auth?.hide();
      }
    });
  }
}
