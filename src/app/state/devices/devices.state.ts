import {Action, State, StateContext} from '@ngxs/store';
import {StreamingDevice, StreamingDevices} from '../../../types';
import {Injectable} from '@angular/core';
import {Devices} from './device.actions';
import {MediaDeviceService} from '../../services/media-device.service';
import {catchError, EMPTY, map, Observable, tap} from 'rxjs';

const defaultDevices: StreamingDevices = {audio: [], video: []};

export interface DevicesStateModel {
  status: 'pending' | 'loading' | 'loaded' | 'failed';
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

  @Action([Devices.LoadAll, Devices.LoadByType])
  onLoadingDevices(context: StateContext<DevicesStateModel>) {
    context.patchState({status: 'loading'});
  }

  @Action(Devices.Loaded)
  onDevicesLoaded(context: StateContext<DevicesStateModel>, {status, error}: Devices.Loaded) {
    context.patchState({status: status == 'failure' ? 'failed' : 'loaded', error});
  }

  @Action(Devices.LoadByType)
  onLoadDevicesByType(context: StateContext<DevicesStateModel>, {deviceType}: Devices.LoadByType) {
    let deviceStream$: Observable<StreamingDevice[]>;
    const state = context.getState();
    if (deviceType == 'video') deviceStream$ = this.deviceService.loadVideoDevices();
    else deviceStream$ = this.deviceService.loadAudioDevices();
    return deviceStream$.pipe(
      tap(devices => {
        if (deviceType == 'audio')
          context.patchState({devices: {...state.devices, audio: devices}});
        else context.patchState({devices: {...state.devices, video: devices}});
        context.dispatch(new Devices.Loaded('success', undefined));
      }),
      catchError((error: Error) => {
        context.dispatch(new Devices.Loaded('failure', error.message));
        return EMPTY;
      }),
      map(() => state.devices)
    );
  }

  @Action(Devices.LoadAll)
  onLoadAllDevices(context: StateContext<DevicesStateModel>) {
    return this.deviceService.loadAllDevices().pipe(
      tap(devices => {
        context.patchState({devices});
        context.dispatch(new Devices.Loaded('success', undefined));
      }),
      catchError((error: Error) => {
        context.dispatch(new Devices.Loaded('failure', error.message));
        return EMPTY;
      })
    )
  }
}
