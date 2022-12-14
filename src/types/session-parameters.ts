import * as mediasoup from 'mediasoup-client';

export type TransportParameters = {
  id: string;
  iceParameters: mediasoup.types.IceParameters;
  dtlsParameters: mediasoup.types.DtlsParameters;
  iceCandidates: mediasoup.types.IceCandidate[];
};

export type SimulcastOptions = {
  encodings: {
    rid: string;
    maxBitrate: number;
    scalabilityMode: string;
    label?: string;
  }[];
  codecOptions?: any;
};

export interface SessionParameters {
  consumableProducers?: { audio?: string; video?: string };
  priority?: 'normal' | 'high';
  sessionId: string;
  displayName: string;
  isLocal: boolean;
  deviceParameters: {
    rtpCapabilities: mediasoup.types.RtpCapabilities;
    transportParameters: TransportParameters;
  };
  appData?: any;
  media?: {
    video?: {
      source: "client" | "remote";
      simulcast: SimulcastOptions;
      codec: string;
    };
    audio?: {
      source: "client" | "remote";
      codec: string;
    };
  }
}
