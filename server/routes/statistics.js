'use strict';

var assign             = require('es5-ext/object/assign')
  , ensureObject       = require('es5-ext/object/valid-object')
  , deferred           = require('deferred')
  , ensureDriver       = require('dbjs-persistence/ensure-driver')
  , db                 = require('../../db')
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
	var queryConf, processingStepsMeta;

	ensureObject(config);
	ensureDriver(config.driver);
	processingStepsMeta = config.processingStepsMeta;
	queryConf = getQueryHandlerConf({
		db: db,
		processingStepsMeta: processingStepsMeta,
		// Eventual system specific query conf
		queryConf: config.queryConf
	});

	timePerPersonPrint = timePerPersonPrint(assign(config));
	timePerRolePrint = timePerRolePrint(assign(config));
	timePerRoleCsv = timePerRoleCsv(assign(config));

	var queryHandler = new QueryHandler(queryConf);

	return assign({
		'get-processing-time-data': function (query) {
			return queryHandler.resolve(query)(function (query) {
				return getProcessingTimesByStepProcessor(assign(config, { query: query }));
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
					getProcessingTimesByStepProcessor(assign(config,
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
