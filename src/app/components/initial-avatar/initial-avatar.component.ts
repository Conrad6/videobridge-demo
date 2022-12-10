import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-initial-avatar',
  templateUrl: './initial-avatar.component.html',
  styleUrls: ['./initial-avatar.component.scss']
})
export class InitialAvatarComponent implements OnInit {
  @Input() text?: string;
  color: string;

  constructor() {
    this.text = '';
    this.color = this.generateColor();
  }

  private generateColor() {
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);
    return `rgb(${r},${g},${b})`;
  }

  ngOnInit(): void {
  }

  get initials() {
    if (!this.text) return '';
    return this.text.split(' ')
      .map(x => x[0])
      .filter(x => x != undefined)
      .map(x => x.toUpperCase().trim())
      .filter(x => x.length > 0)
      .slice(0, 2).join('');
  }
}
