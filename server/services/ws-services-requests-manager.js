'use strict';

var requestLogger = require('../../webservice/request-logger')
  , deferred = require('deferred')
  , resolveProjectRoot = require('cjs-module/resolve-project-root')
  , path        = require('path')
  , projectRoot = process.cwd()
  , debug       = require('debug-ext')('ws-setrvices-requests-manager');

exports.getRequestsDirectory = function () {
	return resolveProjectRoot(projectRoot).then(function (root) {
		if (!root) return;
		return path.resolve(root, 'web-services', 'request-handlers', 'urls');
	});
};

exports.send = function (data) {
	var requestHandler;
	return exports.getRequestsDirectory().then(function (dir) {
		if (!dir) throw new Error('Could not find request handlers directory');
		if (!data.requestHandler) {
			debug('Broken logger data, attempting send with no requestHandler specified');
			return;
		}
		requestHandler = require(path.resolve(dir, data.requestHandler));
		if (!requestHandler) {
			debug('No request handler defined for %s, aborting send.', data.requestHandler);
			return;
		}
		return requestHandler(data);
	});
};

exports.resendErrored = function () {
	return requestLogger.getErrored().then(function (errored) {
		return deferred.map(errored.filter(function (item) {
			return item.requestType === 'sender';
		}), function (requestData) {
			return exports.send(requestData);
		});
	});
};