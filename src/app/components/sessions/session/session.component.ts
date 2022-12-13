import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SessionParameters} from "../../../../types/session-parameters";
import {SessionStreamService} from '../../../services/session-stream.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit, OnDestroy {
  @ViewChild('sessionElement') sessionElement?: ElementRef<HTMLDivElement>;
  @ViewChild('video') video?: ElementRef<HTMLVideoElement>;
  @Input()
  overflow: boolean = false;
  @Input()
  session?: SessionParameters;
  audioOff = false;
  videoOff = false;
  pinned = false;
  private pos1 = 0;
  private pos2 = 0;
  private pos3 = 0;
  private pos4 = 0;
  private sessionWatchSubscription?: Subscription;

  constructor(private readonly sessionStreamService: SessionStreamService) {
  }

  ngOnDestroy(): void {
    this.sessionWatchSubscription?.unsubscribe();
  }

  ngOnInit(): void {

  }

  closeDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  onDrag(event: MouseEvent) {
    event.preventDefault();
    this.pos1 = this.pos3 - event.clientX;
    this.pos2 = this.pos4 - event.clientY;
    this.pos3 = event.clientX;
    this.pos4 = event.clientY;
    const el = this.sessionElement!.nativeElement;
    el.style.top = (el.offsetTop - this.pos2) + 'px';
    el.style.left = (el.offsetLeft - this.pos1) + 'px';
  }

  onMouseDown($event: MouseEvent) {
    $event.preventDefault();
    this.pos3 = $event.clientX;
    this.pos4 = $event.clientY;
    document.onmouseup = () => this.closeDrag();
    document.onmousemove = event => this.onDrag(event);
  }
}
