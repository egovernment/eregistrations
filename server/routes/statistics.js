'use strict';

var assign                            = require('es5-ext/object/assign')
  , normalizeOptions                  = require('es5-ext/object/normalize-options')
  , ensureDriver                      = require('dbjs-persistence/ensure-driver')
  , ensureDatabase                    = require('dbjs/valid-dbjs')
  , ensureObject                      = require('es5-ext/object/valid-object')
  , QueryHandler                      = require('../../utils/query-handler')
  , getBaseRoutes                     = require('./authenticated')
  , timePerPersonPrint                = require('./statistics-time-per-person-print')
  , getProcessingTimesByStepProcessor =
		require('../statistics/get-processing-times-by-step-processor')
  , getQueryHandlerConf               =
		require('../../routes/utils/get-statistics-time-query-handler-conf');

module.exports = exports = function (data) {
	var options         = normalizeOptions(ensureObject(data)), queryConf, processingStepsMeta, db;
	ensureDriver(options.driver);
	db                  = ensureDatabase(options.db);
	processingStepsMeta = options.processingStepsMeta;
	queryConf = getQueryHandlerConf({
		db: db,
		processingStepsMeta: processingStepsMeta
	});
	timePerPersonPrint = timePerPersonPrint(assign(options));

	var queryHandler = new QueryHandler(queryConf);

	return assign({
		'get-processing-time-data': function (query) {
			return queryHandler.resolve(query)(function (query) {
				return getProcessingTimesByStepProcessor(assign(options, { query: query }));
			});
		},
		'get-time-per-person-print': {
			headers: timePerPersonPrint.headers,
			controller: function (query) {
				return queryHandler.resolve(query)(function (query) {
					return timePerPersonPrint.controller({ query: query });
				});
			}
		}
	}, getBaseRoutes());
};
