import { Injectable } from '@angular/core';
import { BehaviorSubject, concat, concatMap, EMPTY, filter, from, fromEvent, map, Observable, of, switchMap, take, zip } from 'rxjs';
import { StreamingDevice, StreamingDevices } from 'src/types/streaming-device';

@Injectable({
  providedIn: 'root'
})
export class MediaDeviceService {
  private devices: BehaviorSubject<StreamingDevices>;
  constructor() {
    this.devices = new BehaviorSubject<StreamingDevices>({
      audio: { in: [], out: [] },
      video: { in: [] }
    });

    fromEvent(navigator.mediaDevices, 'devicechange').subscribe(() => this.loadDevices());
    this.loadDevices();
  }

  get devices$() {
    return this.devices.asObservable();
  }

  getMediaStreamByDeviceId(deviceId: string) {
    return this.devices$.pipe(
      switchMap(devices => {
        return concat(of(...devices.audio.in, ...devices.video.in,))
      }),
      filter(device => device.id == deviceId),
      switchMap(device => {
        if (device.type == 'audio') {
          return from(navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, deviceId } }))
        } else return from(navigator.mediaDevices.getUserMedia({ video: { deviceId } }));
      })
    );
  }

  private loadDevices() {
    const currentDevices = this.devices.getValue();
    currentDevices.audio.in = [];
    currentDevices.video.in = [];
    from(navigator.mediaDevices.getUserMedia({ audio: true, video: true })).pipe(
      switchMap(() => from(navigator.mediaDevices.enumerateDevices())),
      switchMap(devices => from(devices)),
      concatMap(device => {
        let trackStream: Observable<MediaStreamTrack>;
        if (device.kind == 'audioinput') {
          trackStream = from(navigator.mediaDevices.getUserMedia({ audio: { deviceId: device.deviceId } })).pipe(map(stream => stream.getAudioTracks()[0]));
        } else if (device.kind == 'videoinput') {
          trackStream = from(navigator.mediaDevices.getUserMedia({ video: { deviceId: device.deviceId } })).pipe(
            map(stream => stream.getVideoTracks()[0])
          );
        } else {
          trackStream = EMPTY;
        }
        return zip(of(device), trackStream);
      })
    ).subscribe(([deviceInfo, track]) => {
      track.stop();
      const device: StreamingDevice = { type: deviceInfo.kind == 'audioinput' ? 'audio' : 'video', id: deviceInfo.deviceId, text: deviceInfo.label };
      if (deviceInfo.kind == 'audioinput') {
        currentDevices.audio.in = [...currentDevices.audio.in, device];
      }
      if (deviceInfo.kind == 'videoinput') {
        currentDevices.video.in = [...currentDevices.video.in, device];
      }
      this.devices.next(currentDevices);
    })
  }

  getDeviceById(id: string) {
    return this.devices$.pipe(
      map(devices => [...devices.audio.in, ...devices.audio.out, ...devices.video.in]),
      switchMap(devices => of(...devices)),
      filter(device => device.id === id),
      take(1)
    )
  }
}
