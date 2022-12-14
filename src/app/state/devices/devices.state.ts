import {Action, Selector, State, StateContext} from '@ngxs/store';
import {StreamingDevice, StreamingDevices} from '../../../types';
import {Injectable} from '@angular/core';
import {Device} from './device.actions';
import {MediaDeviceService} from '../../services/media-device.service';
import {catchError, EMPTY, map, Observable, tap} from 'rxjs';
import {StateLoadingStatus} from '../state-loading-status';

const defaultDevices: StreamingDevices = {audio: [], video: []};

export interface DevicesStateModel {
  status: StateLoadingStatus;
  devices: StreamingDevices;
  error?: string;
  selected: { audio?: string, video?: string };
}

@State<DevicesStateModel>({
  name: 'devices',
  defaults: {status: 'pending', devices: {...defaultDevices}, selected: {}}
})
@Injectable()
export class DevicesState {
  @Selector()
  static selectedAudio({devices: {selected, devices}}: { devices: DevicesStateModel }) {
    const selectedAudio = selected.audio;
    if (!selectedAudio) return undefined;
    return devices.audio.find(device => device.id === selectedAudio);
  }

  @Selector()
  static selectedVideo({devices: {selected, devices}}: { devices: DevicesStateModel }) {
    const selectedVideo = selected.video;
    if (!selectedVideo) return undefined;
    return devices.video.find(device => device.id === selectedVideo);
  }

  constructor(private deviceService: MediaDeviceService) {
  }

  @Action([Device.LoadAll, Device.LoadByType])
  onLoadingDevices(context: StateContext<DevicesStateModel>) {
    context.patchState({status: 'loading'});
  }

  @Action(Device.Loaded)
  onDevicesLoaded(context: StateContext<DevicesStateModel>, {status, error}: Device.Loaded) {
    context.patchState({status: status == 'failure' ? 'failed' : 'loaded', error});
  }

  @Action(Device.LoadByType)
  onLoadDevicesByType(context: StateContext<DevicesStateModel>, {deviceType}: Device.LoadByType) {
    let deviceStream$: Observable<StreamingDevice[]>;
    const state = context.getState();
    if (deviceType == 'video') deviceStream$ = this.deviceService.loadVideoDevices();
    else deviceStream$ = this.deviceService.loadAudioDevices();
    return deviceStream$.pipe(
      tap(devices => {
        if (deviceType == 'audio')
          context.patchState({devices: {...state.devices, audio: devices}});
        else context.patchState({devices: {...state.devices, video: devices}});
        context.dispatch(new Device.Loaded('success', undefined));
      }),
      catchError((error: Error) => {
        context.dispatch(new Device.Loaded('failure', error.message));
        return EMPTY;
      })
    );
  }

  @Action(Device.LoadAll)
  onLoadAllDevices(context: StateContext<DevicesStateModel>) {
    return this.deviceService.loadAllDevices().pipe(
      tap(devices => {
        context.patchState({devices});
        context.dispatch(new Device.Loaded('success', undefined));
      }),
      catchError((error: Error) => {
        context.dispatch(new Device.Loaded('failure', error.message));
        return EMPTY;
      })
    )
  }

  @Action(Device.Select)
  onDeviceSelect(context: StateContext<DevicesStateModel>,
                 {deviceId, type}: Device.Select) {
    const state = context.getState();
    const device = (type == 'audio' ? state.devices.audio : state.devices.video).find(device => device.id === deviceId);
    if (!device) return;
    let oldId: string | undefined;
    if (type == 'audio') {
      oldId = state.selected.audio;
      context.patchState({selected: {...state.selected, audio: deviceId}});
    } else {
      oldId = state.selected.video;
      context.patchState({selected: {...state.selected, video: deviceId}});
    }
    if (oldId === deviceId) return;
    context.dispatch(new Device.SelectionChanged(type, oldId, deviceId));
  }
}
