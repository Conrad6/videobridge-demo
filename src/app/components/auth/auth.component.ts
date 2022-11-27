import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements AfterViewInit {
  @ViewChild('authDialog') private authDialog?: ElementRef<HTMLDialogElement>

  constructor() { }

  ngAfterViewInit(): void {
    this.authDialog?.nativeElement.showModal();
  }

  hide() {
    this.authDialog?.nativeElement.close();
  }

  show() {
    this.authDialog?.nativeElement.showModal();
  }

}
