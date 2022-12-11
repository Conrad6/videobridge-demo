import {Action, State, StateContext} from '@ngxs/store';
import {StreamingDevice, StreamingDevices} from '../../../types';
import {Injectable} from '@angular/core';
import {Device} from './device.actions';
import {MediaDeviceService} from '../../services/media-device.service';
import {catchError, EMPTY, map, Observable, tap} from 'rxjs';
import {StateLoadingStatus} from '../state-loading-status';

const defaultDevices: StreamingDevices = {audio: [], video: []};

export interface DevicesStateModel {
  status: StateLoadingStatus;
  devices: StreamingDevices,
  error?: string
}

@State<DevicesStateModel>({
  name: 'devices',
  defaults: {status: 'pending', devices: {...defaultDevices}}
})
@Injectable()
export class DevicesState {
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
      }),
      map(() => state.devices)
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
}
