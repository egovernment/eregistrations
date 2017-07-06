'use strict';

var debug                   = require('debug-ext')('webservice-handler:request-dispatcher')
  , receiverWsHandler       = require('./handlers/receiver')
  , senderWsHandler         = require('./handlers/sender')
  , receiverSenderWsHandler = require('./handlers/receiver-sender')
  , senderReceiverWsHandler = require('./handlers/sender-receiver');

module.exports = function (options) {
	// TODO: Can we already log something here?
	switch (options.configuration.type) {
	case 'receiver':
		receiverWsHandler(options);
		break;
	case 'sender':
		senderWsHandler(options);
		break;
	case 'receiver-sender':
		receiverSenderWsHandler(options);
		break;
	case 'sender-receiver':
		senderReceiverWsHandler(options);
		break;
	default:
		debug('Unsupported request:', options.configuration);
	}
};
