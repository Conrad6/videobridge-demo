export type StreamingDevice = {
  id: string, text: string, type: 'audio' | 'video';
};

export type StreamingDevices = {
  audio: {
    in: StreamingDevice[],
    out: StreamingDevice[]
  },
  video: {
    in: StreamingDevice[]
  }
};

export type State = {
  displayName: string;
  audioDevice: StreamingDevice;
  videoDevice: StreamingDevice;
}
