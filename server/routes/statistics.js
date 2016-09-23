'use strict';

var assign                  = require('es5-ext/object/assign')
  , ensureCallable          = require('es5-ext/object/valid-callable')
  , ensureObject            = require('es5-ext/object/valid-object')
  , ensureDriver            = require('dbjs-persistence/ensure-driver')
  , db                      = require('../../db')
  , QueryHandler            = require('../../utils/query-handler')
  , toDateInTz              = require('../../utils/to-date-in-time-zone')
  , getData                 = require('../business-process-query/get-data')
  , filterSteps             = require('../business-process-query/steps/filter')
  , filterBusinessProcesses = require('../business-process-query/business-processes/filter')
  , reduceSteps             = require('../business-process-query/steps/reduce-time')
  , reduceBusinessProcesses = require('../business-process-query/business-processes/reduce-time')
  , timePerPersonPrint      = require('../pdf-renderers/statistics-time-per-person')
  , timePerRolePrint        = require('../pdf-renderers/statistics-time-per-role')
  , timePerRoleCsv          = require('../csv-renderers/statistics-time-per-role')
  , makePdf                 = require('./utils/pdf')
  , makeCsv                 = require('./utils/csv')
  , getBaseRoutes           = require('./authenticated');

var getQueryHandlerConf = require('../../routes/utils/get-statistics-time-query-handler-conf');

module.exports = function (config) {
	var driver = ensureDriver(ensureObject(config).driver)
	  , processingStepsMeta = ensureObject(config.processingStepsMeta)
	  , customChartsController;

	if (config.customChartsController) {
		customChartsController = ensureCallable(config.customChartsController);
	}
	var queryConf = getQueryHandlerConf({
		db: db,
		processingStepsMeta: processingStepsMeta
	});

	var queryHandler = new QueryHandler(queryConf);

	var resolveTimePerRole = function (query) {
		return getData(driver, processingStepsMeta)(function (data) {
			var stepsResult;
			// We need:
			// steps | filter(query) | reduce()[byStep, all]
			// businessProcesses | filter(query) | reduce().all
			stepsResult = reduceSteps(filterSteps(data, query, processingStepsMeta),
				processingStepsMeta);
			return {
				steps: { byStep: stepsResult.byStep, all: stepsResult.all },
				businessProcesses: reduceBusinessProcesses(filterBusinessProcesses(data, query)).all
			};
		});
	};

	var resolveTimePerPerson = function (query) {
		return getData(driver, processingStepsMeta)(function (data) {
			// We need:
			// steps | filter(query) | reduce()[byStepAndProcessor, byStep]
			data = reduceSteps(filterSteps(data, query, processingStepsMeta), processingStepsMeta);
			return { byStep: data.byStep, byStepAndProcessor: data.byStepAndProcessor };
		});
	};

	return assign({
		'get-time-per-role': function (query) {
			return queryHandler.resolve(query)(resolveTimePerRole);
		},
		'time-per-role.pdf': makePdf(function (query) {
			return queryHandler.resolve(query)(resolveTimePerRole)(function (data) {
				return timePerRolePrint(data, config);
			});
		}),
		'time-per-role.csv': makeCsv(function (query) {
			return queryHandler.resolve(query)(resolveTimePerRole)(function (data) {
				return timePerRoleCsv(data, config);
			});
		}),
		'get-time-per-person': function (query) {
			return queryHandler.resolve(query)(function (query) {
				return getData(driver, processingStepsMeta)(function (data) {
					return resolveTimePerPerson(data, config);
				});
			});
		},
		'time-per-person.pdf': makePdf(function (query) {
			return queryHandler.resolve(query)(resolveTimePerPerson)(function (data) {
				return timePerPersonPrint(data, config);
			});
		}),
		'get-dashboard-data': function (query) {
			return queryHandler.resolve(query)(function (query) {
				return getData(driver, processingStepsMeta)(function (data) {
					var lastDateQuery = assign(query, { dateFrom: null, dateTo: null,
						pendingAt: query.dateTo || toDateInTz(new Date(), db.timeZone) });
					// Spec of data we need for each chart:
					// # Files completed per time range
					//   businessProcesses | filter(query) | reduce().byDateAndService
					// # Processed files
					//   steps | filter(query) | reduce().byStepAndService
					// # Pending files at ${lastDate}
					//   steps | filter(lastDateQuery) | reduce().byStep
					// # Average processing time in days
					//   steps | filter(query) | reduce().byStepAndService
					// # Total average processing time per service in days
					//   businessProcesses | filter(query) | reduce().byService
					// # Withdrawal time in days
					//   steps | filter(query) | reduce().byStepAndService
					var result = {
						dateRangeData: {
							steps: reduceSteps(filterSteps(data, query, processingStepsMeta),
								processingStepsMeta).byStepAndService,
							businessProcesses: reduceBusinessProcesses(filterBusinessProcesses(data, query))
						},
						lastDateData: reduceSteps(filterSteps(data, lastDateQuery, processingStepsMeta),
							processingStepsMeta).byStep
					};
					if (customChartsController) customChartsController(query, result, lastDateQuery);
					return result;
				});
			});
		}
	}, getBaseRoutes());
};
