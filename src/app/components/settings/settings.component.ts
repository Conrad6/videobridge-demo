import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest, combineLatestWith, EMPTY, from, fromEvent, map, Observable, of, switchMap } from 'rxjs';
import { StreamingDeviceService } from 'src/app/services/streaming-device.service';
import { StreamingDevices } from 'src/types/streaming-device';



@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  @ViewChild('settingsDialog') settingsDialogRef?: ElementRef;
  showSettings() {
    if (!this.settingsDialogRef) return;
    const settingsDialog = this.settingsDialogRef.nativeElement as HTMLDialogElement;
    settingsDialog.showModal();
  }

  closeSettings() {
    if (!this.settingsDialogRef) return;
    const settingsDialog = this.settingsDialogRef.nativeElement as HTMLDialogElement;
    settingsDialog.close();
  }

  devices: StreamingDevices
  settingsForm: FormGroup;

  constructor(private streamingDeviceService: StreamingDeviceService,
    formBuilder: FormBuilder) {
    this.settingsForm = formBuilder.group({
      displayName: [''],
      audioInId: [null],
      videoInId: [null]
    });

    this.devices = { audio: { in: [], out: [] }, video: { in: [] } };
    from(navigator.mediaDevices.getUserMedia({ audio: true, video: true }))
      .subscribe(() => {
        this.setupDevices();
        navigator.mediaDevices.ondevicechange = (_) => {
          this.setupDevices();
        };
      });
  }

  private setupDevices() {
    from(navigator.mediaDevices.enumerateDevices()).pipe(
      switchMap(devices => of(...devices))
    ).subscribe(device => this.setupDevice(device));
  }

  private setupDevice(device: MediaDeviceInfo) {

    let trackStream: Observable<MediaStreamTrack>;

    if (device.kind == 'audioinput') {
      trackStream = from(navigator.mediaDevices.getUserMedia({
        audio: { deviceId: device.deviceId }
      })).pipe(
        map(stream => stream.getAudioTracks()[0])
      );
    } else if (device.kind == 'videoinput') {
      trackStream = from(navigator.mediaDevices.getUserMedia({
        video: { deviceId: device.deviceId }
      })).pipe(
        map(stream => stream.getVideoTracks()[0])
      );
    } else {
      trackStream = EMPTY;
    }
    trackStream.subscribe(track => {
      if (device.kind == 'audioinput') {
        this.devices.audio.in = [...this.devices.audio.in, { track, id: device.deviceId, text: device.label }];
      } else if (device.kind == 'audiooutput') {
        this.devices.audio.out = [...this.devices.audio.out, { id: device.deviceId, text: device.label }];
      } else if (device.kind == 'videoinput') {
        this.devices.video.in = [...this.devices.video.in, { track, id: device.deviceId, text: device.label }];
      }
    });
  }

  ngOnInit(): void {
  }

  wrapTrack(track?: MediaStreamTrack) {
    if (!track) return null;
    return new MediaStream([track]);
  }

}
