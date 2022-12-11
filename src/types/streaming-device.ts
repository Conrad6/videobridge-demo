export type DeviceType = 'audio' | 'video';

export type StreamingDevice = {
  id: string, text: string, type?: DeviceType;
};

export type StreamingDevices = {
  audio: StreamingDevice[],
  video: StreamingDevice[]
};

export type State = {
  displayName: string;
  audioDevice: StreamingDevice;
  videoDevice: StreamingDevice;
}
