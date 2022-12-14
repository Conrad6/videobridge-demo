export class NoSelectedDeviceError extends Error {
  constructor(public type: 'audio' | 'video', message: string = 'No device selected') {
    super(message);
  }
}
