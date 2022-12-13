import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { combineLatestWith, concat, forkJoin, map, mergeMap, of, switchMap } from 'rxjs';
import { MediaDeviceService } from 'src/app/services/media-device.service';
import { ScopeService } from 'src/app/services/scope.service';
import { StreamingDevices } from 'src/types/streaming-device';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  ngOnInit(): void {
  }
  /*@ViewChild('settingsDialog') settingsDialogRef?: ElementRef<HTMLDialogElement>;
  dotSequence = [...Array(10).keys()];
  audioContext: AudioContext;
  testingAudio = false;
  showSettings() {
    if (!this.settingsDialogRef) return;
    const settingsDialog = this.settingsDialogRef.nativeElement as HTMLDialogElement;
    const state = this.stateService.state.snapshot;
    this.settingsForm.setValue({
      displayName: state?.displayName,
      audioInId: state?.audioDevice?.id,
      videoInId: state?.videoDevice?.id
    });
    this.settingsForm.markAsPristine({ onlySelf: true });
    settingsDialog.showModal();
    this.startVideoStreams();
  }

  toggleAudioTest() {
    if (this.testingAudio) this.stopAudio();
    else this.playAudio();
  }

  startVideoStreams() {
    this.deviceService.devices$.pipe(
      switchMap(devices => concat(of(...devices.video.in))),
      map(device => ({ type: device.type, deviceId: device.id })),
      mergeMap(device => this.deviceService.getMediaStreamByDeviceId(device.deviceId)
        .pipe(combineLatestWith(of(device))))
    ).subscribe(([stream, { deviceId, type }]) => {
      if (type == 'video') {
        const videoTarget: HTMLVideoElement = document.getElementById(deviceId) as HTMLVideoElement;
        if (videoTarget) {
          videoTarget.srcObject = stream;
        }
      }
    });
  }

  playAudio() {
    const deviceId = this.settingsForm.controls['audioInId'].value;
    this.deviceService.getMediaStreamByDeviceId(deviceId).subscribe(stream => {
      if (!stream) return;
      this.testingAudio = true;
      const audioTarget = document.getElementById('audioTest') as HTMLAudioElement;
      audioTarget.srcObject = stream;
    })
  }

  stopAudio() {
    const audioTarget: HTMLAudioElement = document.getElementById('audioTest') as HTMLAudioElement;
    if (audioTarget) {
      const stream = audioTarget.srcObject as MediaStream;
      audioTarget.srcObject = null;
      this.testingAudio = false;
      stream?.getTracks().forEach(track => track.stop());
    }
  }

  stopVideoStreams() {
    this.deviceService.devices$.pipe(
      switchMap(devices => concat(of(...devices.video.in))),
      map(device => device.id),
    ).subscribe((deviceId) => {
      const videoTarget: HTMLVideoElement = document.getElementById(deviceId) as HTMLVideoElement;
      if (videoTarget) {
        const stream = videoTarget.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        videoTarget.srcObject = null;
      }
    });
  }

  closeSettings() {
    this.testingAudio = false;
    if (!this.settingsDialogRef) return;
    const settingsDialog = this.settingsDialogRef.nativeElement;
    settingsDialog.close();
    this.stopVideoStreams();
    this.stopAudio();
  }

  devices: StreamingDevices
  settingsForm: FormGroup;

  constructor(private stateService: ScopeService,
    readonly deviceService: MediaDeviceService,
    formBuilder: FormBuilder) {
    this.audioContext = new AudioContext();
    this.settingsForm = formBuilder.group({
      displayName: [this.stateService.state.snapshot?.displayName],
      audioInId: [this.stateService.state.snapshot?.audioDevice?.id],
      videoInId: [this.stateService.state.snapshot?.videoDevice?.id]
    });

    this.devices = { audio: { in: [], out: [] }, video: { in: [] } };
    this.setupDevices();
    this.settingsForm.controls['audioInId'].valueChanges.subscribe((valueUpdate) => {
      if (!valueUpdate || valueUpdate == '') {
        this.stopAudio();
      } else if (this.testingAudio) {
        this.playAudio();
      }
    })
  }

  private setupDevices() {
    this.deviceService.devices$.subscribe(devices => {
      this.devices = devices;
    })
  }

  ngOnInit(): void {
    const settingsDialog = this.settingsDialogRef?.nativeElement;
    if (!settingsDialog) return;
  }

  updateSettings() {
    forkJoin({
      audioDevice: this.deviceService.getDeviceById(this.settingsForm.get('audioInId')?.value),
      displayName: of(this.settingsForm.get('displayName')?.value as string),
      videoDevice: this.deviceService.getDeviceById(this.settingsForm.get('videoInId')?.value)
    }).subscribe(state => {
      this.stateService.updateState(state);
      this.settingsForm.setValue({
        displayName: state.displayName,
        audioInId: state.audioDevice.id,
        videoInId: state.videoDevice.id
      });
      this.settingsForm.markAsPristine({ onlySelf: true });
      this.closeSettings();
    });
  }*/
}
