'use strict';

var debug              = require('debug-ext')('business-process-data-forms-print')
  , ensureCallable     = require('es5-ext/object/valid-callable')
  , ensureObject       = require('es5-ext/object/valid-object')
  , ensureString       = require('es5-ext/object/validate-stringifiable-value')
  , resolve            = require('path').resolve
  , unlink             = require('fs2/unlink')
  , storagesPromise    = require('./utils/business-process-storages')

  , re = /^\/business-process-data-forms-([0-9][0-9a-z]+)-[0-9]+\.pdf$/;

var resolvePdfPath = function (businessProcessId, uploadsPath) {
	return resolve(uploadsPath, 'business-process-data-forms-' + businessProcessId + '.pdf');
};

exports.filenameResetService = function (data) {
	var uploadsPath = ensureString(ensureObject(data).uploadsPath);

	var eventHandler = function (event) {
		var businessProcessId = event.ownerId
		  , filename          = resolvePdfPath(businessProcessId, uploadsPath);

		unlink(filename).done(null, function (err) {
			if (err.code === 'ENOENT') return;
			debug("Could not remove file %s %s", filename, err.stack);
		});
	};

	storagesPromise(function (storages) {
		storages.forEach(function (storage) {
			storage.on('key:dataForms/lastEditStamp', eventHandler);
			storage.on('key:dataForms/dataSnapshot/jsonString', eventHandler);
		});
	});
};

exports.printServer = function (config) {
	var queryHandler = ensureCallable(ensureObject(config).queryHandler)
	  , uploadsPath  = ensureString(config.uploadsPath)
	  , stMiddleware = ensureCallable(config.stMiddleware);

	return function (req, res, next) {
		var url   = req._parsedUrl.pathname
		  , match = url.match(re)
		  , businessProcessId, filePath;

		if (!match) {
			next();
			return;
		}

		businessProcessId = match[1];
		filePath = resolve(uploadsPath, url.slice(1));

		queryHandler([businessProcessId], 'generateDataFormsPdf', {
			businessProcessId: businessProcessId,
			filePath: filePath
		}).done(function (result) {
			if (!result) {
				res.statusCode = 404;
				res.end('Not Found');
				return;
			}
			return stMiddleware(req, res, next);
		}, function (err) {
			debug(err.stack);
			res.statusCode = 500;
			res.end('Server error');
		});
	};
};
