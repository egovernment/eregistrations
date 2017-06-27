'use strict';

var readdir           = require('fs2/readdir')
  , readFile          = require('fs2/read-file')
  , resolve           = require('path').resolve
  , debug             = require('debug-ext')('webservice-handler:middleware')
  , startsWith        = require('es5-ext/string/#/starts-with')
  , objectSome        = require('es5-ext/object/some')
  , soap              = require('soap')
  , requestDispatcher = require('request-dispatcher')

  , apiPathname = '/api/';

module.exports = function (configurationsPath) {
	var restWsConfigs = []
	  , soapWsConfigs = []
	  , soapServerCbs = {};

	var wsConfigs = [];

	debug('Loading Web Service configurations');

	// Scan all configurations
	readdir(configurationsPath, { type: { file: true } }).map(function (filename) {
		return readFile(resolve(configurationsPath, filename), 'utf8')(JSON.parse);
	})(function (configs) {
		// Filter out non receivers
		return configs.filter(function (config) {
			return startsWith.call(config.type, 'receiver');
		});
	}).map(function (config) {
		debug('Register', config.name, 'web service');

		if (config.communicationType !== 'SOAP') {
			soapWsConfigs.push(config);
		} else if (config.communicationType !== 'SOAP') {
			restWsConfigs.push(config);
		} else {
			debug('Unsupported web service configuration:', config);
		}
	}).done();

	// Setup SOAP server handlers
	soapWsConfigs.forEach(function (wsConfig) {
		// This hack gets soap module (that doesn't support connect) to work with our setup
		var Server = {
			use: function () {},
			route: function (path) {
				if (path !== wsConfig.url) {
					debug('Error while setting up SOAP handler: Unrecognized path\'', path, '\'');
					return;
				}

				return {
					all: function (callback) {
						// Register soap module server handler
						soapServerCbs[path] = callback;
					}
				};
			}
		};

		// TODO: Setup services and dynamically create wsdl
		// soap.listen(Server, wsConfig.url, services, wsdl);
	});

	// Return middleware for use with connect
	return function (req, res, next) {
		var path = req._parsedUrl.pathname
		  , requestHandled;

		// Filter out non api calls
		if (!startsWith.call(path, apiPathname)) {
			next();
			return;
		}
		path = path.slice(apiPathname.length);

		// Handle REST Web Services
		requestHandled = wsConfigs.some(function (wsConfig) {
			// Filter out 404's
			if (!startsWith.call(path, wsConfig.url)) return false;

			// Call handler
			requestDispatcher({
				configuration: wsConfig,
				requestData: req.data,
				responseStream: res
			});

			return true;
		});

		if (requestHandled) return;

		// Handle SOAP Web Services
		requestHandled = objectSome(soapServerCbs, function (serverCb, url) {
			if (!startsWith.call(path, url)) return false;

			// Pass request to soap library server handler
			serverCb(req, res, next);

			return true;
		});

		if (requestHandled) return;

		next();
	};
};
