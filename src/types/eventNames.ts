export const eventNames = {
  init            : 'INIT',
  transportConnect: 'TRANSPORT_CONNECT',
  localSessionEnd : 'SESSION_END',
  publishParams   : 'PUBLISH_PARAMS',
  consumeParams   : 'CONSUME_PARAMS',
  newProducer     : 'NEW_PRODUCER',
  createProducer  : 'CREATE_PRODUCER',
  createConsumer  : 'CREATE_CONSUMER',
  remoteProducer  : 'REMOTE_PRODUCER',
  producerClosed  : 'REMOTE_PRODUCER_CLOSED',
  remoteSessionEnd: 'SESSION_END',
  closeProducer   : 'CLOSE_PRODUCER'
} as const;
