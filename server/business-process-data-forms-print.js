'use strict';

var debug              = require('debug-ext')('business-process-data-forms-print')
  , ensureCallable     = require('es5-ext/object/valid-callable')
  , ensureObject       = require('es5-ext/object/valid-object')
  , ensureString       = require('es5-ext/object/validate-stringifiable-value')
  , resolve            = require('path').resolve

  , re = /^\/business-process-data-forms-([0-9][0-9a-z]+)\.pdf$/;

module.exports = function (config) {
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
		//
	};
};
