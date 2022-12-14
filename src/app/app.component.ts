import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {AuthComponent} from './components/auth/auth.component';
import {AuthService} from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('auth') auth?: AuthComponent;

  constructor(readonly authService: AuthService) {
  }

  ngAfterViewInit(): void {

  }
}
