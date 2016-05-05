'use strict';

var debug              = require('debug-ext')('business-process-data-forms-print')
  , ensureCallable     = require('es5-ext/object/valid-callable')
  , ensureObject       = require('es5-ext/object/valid-object')
  , ensureString       = require('es5-ext/object/validate-stringifiable-value')

  , re = /^\/business-process-data-forms-([0-9][0-9a-z]+)\.pdf$/;

module.exports = function (config) {
	var queryHandler = ensureCallable(ensureObject(config).queryHandler)
	  , uploadsPath  = ensureString(config.uploadsPath)
	  , isDev        = ensureObject(config.env).dev
	  , stMiddleware = ensureCallable(config.stMiddleware);

	debug('Delcaring');

	return function (req, res, next) {
		var url   = req._parsedUrl.pathname
		  , match = url.match(re)
		  , archive, archiveFile, onError, businessProcessId;

		debug('matching:', url);

		if (!match) {
			debug('not matched');
			next();
			return;
		}
		debug('matched!');

		businessProcessId = match[1];
		queryHandler([businessProcessId], 'generateDataFormsPdf', {
			businessProcessId: businessProcessId
		}).done(function (result) {
			if (!result) {
				debug('not found');
				res.statusCode = 404;
				res.end('Not Found');
				return;
			}
			debug('done processing');
			return stMiddleware(req, res, next);
		}, function (err) {
			debug('error');
			debug(err.stack);
			res.statusCode = 500;
			res.end('Server error');
		});
		//
	};
};
