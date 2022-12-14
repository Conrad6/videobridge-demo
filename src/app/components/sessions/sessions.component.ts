import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Select} from '@ngxs/store';
import {
  LocalSessionModel,
  RemoteSessionModel,
  SessionsStateModel,
  SessionState
} from '../../state/sessions/session.state';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {

  @Select(SessionState.allSessions) sessions$!: Observable<SessionsStateModel[]>;
  @Select(SessionState.remoteSessions) remoteSessions$!: Observable<RemoteSessionModel[]>;
  @Select(SessionState.localSession) localSession$!: Observable<LocalSessionModel>;

  constructor() {
  }

  ngOnInit(): void {
  }

}
