export type StreamingDevices = {
  audio: {
    in: { id: string, text: string, track?: MediaStreamTrack }[],
    out: { id: string, text: string, track?: MediaStreamTrack }[]
  },
  video: {
    in: { id: string, text: string, track?: MediaStreamTrack }[]
  }
};
