import {Injectable} from '@angular/core';
import {Select} from '@ngxs/store';
import {Device} from '../state/devices/device.actions';
import {StreamingDevice} from '../../types';
import {from, Observable, of, switchMap, take, throwError} from 'rxjs';
import {DevicesState} from '../state/devices/devices.state';
import {NoSelectedDeviceError} from '../errors/NoSelectedDeviceError';


@Injectable({providedIn: 'root'})
export class StreamService {
  @Select(DevicesState.selectedAudio)
  private selectedAudio$!: Observable<StreamingDevice | undefined>;

  @Select(DevicesState.selectedVideo)
  private selectedVideo$!: Observable<StreamingDevice | undefined>;

  createLocalTrack(type: "audio" | "video") {
    const deviceStream$ = type == 'audio' ? this.selectedAudio$ : this.selectedVideo$;
    return deviceStream$.pipe(
      switchMap(device => {
        if(!device) return throwError(() => new NoSelectedDeviceError(type));
        return this.getDeviceMediaTrack(device)
      }),
      take(1)
    )
  }

  private getDeviceMediaTrack(device: StreamingDevice) {
    let constraints: MediaStreamConstraints;
    if (device.type == 'audio')
      constraints = {
        audio: {
          deviceId: device.id,
          echoCancellation: true
        }
      };
    else constraints = {
      video: {
        aspectRatio: {ideal: 16 / 9},
        facingMode: {ideal: 'user'},
        frameRate: {ideal: 60},
        deviceId: device.id
      }
    };

    return from(navigator.mediaDevices.getUserMedia(constraints)).pipe(
      switchMap(stream => {
        if (device.type == 'audio') return of(stream.getAudioTracks()[0]);
        return of(stream.getVideoTracks()[0]);
      })
    );
  }
}
