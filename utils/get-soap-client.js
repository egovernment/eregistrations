'use strict';

var memoize          = require('memoizee/plain')
  , promisify        = require('deferred').promisify
  , soap             = require('soap')
  , debug            = require('debug-ext')('soap')

  , createSoapClient = promisify(soap.createClient);

module.exports = memoize(function (wsdlUrl, soapUrl) {
	debug('creating soap client (%s)', soapUrl);

	return createSoapClient(wsdlUrl, { endpoint: soapUrl })(function (client) {
		var services = client.wsdl.definitions.services
		  , ports, methods, method, promisifiedMethodName;

		Object.getOwnPropertyNames(services).forEach(function (serviceName) {
			ports = services[serviceName].ports;

			Object.getOwnPropertyNames(ports).forEach(function (portName) {
				methods = ports[portName].binding.methods;

				Object.getOwnPropertyNames(methods).forEach(function (methodName) {
					method = client[methodName];
					promisifiedMethodName = methodName + 'P';

					if (method && !client[promisifiedMethodName]) {
						client[promisifiedMethodName] = promisify(method);
					}
				});
			});
		});

		return client;
	});
}, { primitive: true });
