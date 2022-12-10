import {Component, OnInit} from '@angular/core';
import {
  BehaviorSubject,
  defaultIfEmpty, distinctUntilChanged, distinctUntilKeyChanged,
  filter,
  first,
  from,
  map,
  mergeMap,
  Observable, of,
  reduce,
  scan, switchScan,
  toArray
} from 'rxjs';
import {SessionParameters} from 'src/types/session-parameters';
import {SessionService} from '../../services/session.service';
import {zip} from 'rxjs/internal/operators/zip';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {

  private sessions: BehaviorSubject<SessionParameters[]>;

  constructor(private readonly sessionService: SessionService) {
    this.sessions = new BehaviorSubject<SessionParameters[]>([]);
  }

  get remoteSessions$() {
    return this.sessions.pipe(
      map(sessions => sessions.filter(session => !session.isLocal)),
    );
  }

  get localSession$(): Observable<SessionParameters> {
    return this.sessions.pipe(
      mergeMap(sessions => from(sessions)),
      filter(session => session.isLocal),
      first()
    );
  }

  ngOnInit(): void {
    this.sessionService.allSessions$.pipe(
      distinctUntilKeyChanged('sessionId'),
      scan((acc, session) => {
        return [...acc, session];
      }, Array<SessionParameters>()),
    ).subscribe(sessions => {
      this.sessions.next(sessions);
    });
  }

}
