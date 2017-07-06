'use strict';

var debug = require('debug-ext')('webservice-handler:receiver-sender');

module.exports = function (options) {
	debug('Started with options: ', options);

	options.responseStream.end(options.configuration.name);
};
