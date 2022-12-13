export const eventNames = {
  init: 'INIT',
  transportConnect: 'TRANSPORT_CONNECT',
  localSessionEnd: 'SESSION_END',
  publishParams: 'PUBLISH_PARAMS',
  consumeParams: 'CONSUME_PARAMS',
  producerCreated: 'NEW_PRODUCER',
  createProducer: 'CREATE_PRODUCER',
  createConsumer: 'CREATE_CONSUMER',
  consumerCreated: 'CONSUMER_CREATED',
  newRemoteProducer: 'REMOTE_PRODUCER_CREATED',
  remoteProducerClosed: 'REMOTE_PRODUCER_CLOSED',
  remoteSessionEnd: 'SESSION_END',
  closeProducer: 'CLOSE_PRODUCER',
  pauseConsumer: "PAUSE_CONSUMER",
  resumeConsumer: 'RESUME_CONSUMER'
} as const;
