import {Injectable} from '@angular/core';
import {filter, forkJoin, from, map, Observable, switchMap, toArray} from 'rxjs';
import {StreamingDevice, StreamingDevices} from 'src/types/streaming-device';
import {Store} from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})
export class MediaDeviceService {

  loadVideoDevices(): Observable<StreamingDevice[]> {
    return this.loadAllDevices().pipe(map(devices => devices.video));
  }

  loadAudioDevices(): Observable<StreamingDevice[]> {
    return this.loadAllDevices().pipe(map(devices => devices.audio));
  }

  loadAllDevices(): Observable<StreamingDevices> {
    return from(navigator.mediaDevices.enumerateDevices()).pipe(
      switchMap(devices => {
        const deviceStream$ = from(devices).pipe(
          map(({deviceId: id, label: text, kind}) => ({
            type: kind == 'audioinput' ? 'audio' : 'video',
            text,
            id
          } as StreamingDevice))
        );
        return forkJoin({
          audio: deviceStream$.pipe(filter(device => device.type == 'audio'), toArray()),
          video: deviceStream$.pipe(filter(device => device.type == 'video'), toArray())
        })
      })
    );
  }
}
