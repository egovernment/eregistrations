'use strict';

var assign             = require('es5-ext/object/assign')
  , normalizeOptions   = require('es5-ext/object/normalize-options')
  , ensureObject       = require('es5-ext/object/valid-object')
  , deferred           = require('deferred')
  , ensureDatabase     = require('dbjs/valid-dbjs')
  , ensureDriver       = require('dbjs-persistence/ensure-driver')
  , QueryHandler       = require('../../utils/query-handler')
  , timePerPersonPrint = require('./controllers/statistics-time-per-person-print')
  , timePerRolePrint   = require('./controllers/statistics-time-per-role-print')
  , timePerRoleCsv     = require('./controllers/statistics-time-per-role-csv')
  , getBaseRoutes      = require('./authenticated');

var getProcessingTimesByStepProcessor =
	require('../statistics/business-process/query-times');
var getFilesApprovedByDateAndService =
	require('../statistics/business-process/get-files-approved-by-date-and-service');
var getFilesPendingByStepAndService =
	require('../statistics/business-process/get-files-pending-by-step-and-service');
var getQueryHandlerConf = require('../../routes/utils/get-statistics-time-query-handler-conf');

module.exports = function (config) {
	var options = normalizeOptions(ensureObject(config))
	  , queryConf, processingStepsMeta, db;

	ensureDriver(options.driver);
	db = ensureDatabase(options.db);
	processingStepsMeta = options.processingStepsMeta;
	queryConf = getQueryHandlerConf({
		db: db,
		processingStepsMeta: processingStepsMeta,
		// Eventual system specific query conf
		queryConf: options.queryConf
	});

	timePerPersonPrint = timePerPersonPrint(assign(options));
	timePerRolePrint = timePerRolePrint(assign(options));
	timePerRoleCsv = timePerRoleCsv(assign(options));

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
		},
		'get-time-per-role-print': {
			headers: timePerRolePrint.headers,
			controller: function (query) {
				return queryHandler.resolve(query)(function (query) {
					return timePerRolePrint.controller({ query: query });
				});
			}
		},
		'get-time-per-role-csv': {
			headers: timePerRoleCsv.headers,
			controller: function (query) {
				return queryHandler.resolve(query)(function (query) {
					return timePerRoleCsv.controller({ query: query });
				});
			}
		},
		'get-dashboard-data': function (query) {
			return queryHandler.resolve(query)(function (query) {
				var finalResult = {}, today = new Date();
				return deferred(
					getProcessingTimesByStepProcessor(assign(options,
						{ query: query }))(function (result) {
						assign(finalResult, result);
					}),
					getFilesApprovedByDateAndService(query)(function (filesApproved) {
						assign(finalResult, { filesApprovedByDay: filesApproved });
					}),
					getFilesPendingByStepAndService(query.dateTo ||
						new db.Date(today.getUTCFullYear(), today.getUTCMonth(),
							today.getUTCDate()), processingStepsMeta)(function (pendingFiles) {
						assign(finalResult, { pendingFiles: pendingFiles });
					})
				)(finalResult);
			});
		}
	}, getBaseRoutes());
};
