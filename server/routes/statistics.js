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
  , getQueryHandlerConf     = require('../../apps/statistics/get-query-conf')
  , timePerPersonPrint      = require('../pdf-renderers/statistics-time-per-person')
  , timePerRolePrint        = require('../pdf-renderers/statistics-time-per-role')
  , timePerRoleCsv          = require('../csv-renderers/statistics-time-per-role')
  , makePdf                 = require('./utils/pdf')
  , makeCsv                 = require('./utils/csv')
  , getBaseRoutes           = require('./authenticated');

module.exports = function (config) {
	var driver = ensureDriver(ensureObject(config).driver)
	  , processingStepsMeta = ensureObject(config.processingStepsMeta)
	  , customChartsController;

	if (config.customChartsController) {
		customChartsController = ensureCallable(config.customChartsController);
	}
	var queryConf = getQueryHandlerConf({ processingStepsMeta: processingStepsMeta });

	var queryHandler = new QueryHandler(queryConf);

	var resolveTimePerRole = function (query) {
		return getData(driver, processingStepsMeta)(function (data) {
			var stepsResult;
			// We need:
			// steps | filter(query) | reduce()[byStep, all]
			// businessProcesses | filter(query) | reduce().all
			stepsResult = reduceSteps(filterSteps(data.steps, query, processingStepsMeta),
				processingStepsMeta);
			return {
				steps: { byStep: stepsResult.byStep, all: stepsResult.all },
				businessProcesses: reduceBusinessProcesses(filterBusinessProcesses(data.businessProcesses,
					query)).all
			};
		});
	};

	var resolveTimePerPerson = function (query) {
		return getData(driver, processingStepsMeta)(function (data) {
			// We need:
			// steps | filter(query) | reduce()[byStepAndProcessor, byStep]
			data = reduceSteps(filterSteps(data.steps, query, processingStepsMeta), processingStepsMeta);
			return { byStep: data.byStep, byStepAndProcessor: data.byStepAndProcessor };
		});
	};

	var rendererConfig = {
		processingStepsMeta: processingStepsMeta,
		logo: config.logo
	};

	return assign({
		'get-time-per-role': function (query) {
			return queryHandler.resolve(query)(resolveTimePerRole);
		},
		'time-per-role.pdf': makePdf(function (query) {
			return queryHandler.resolve(query)(resolveTimePerRole)(function (data) {
				return timePerRolePrint(data, rendererConfig);
			});
		}),
		'time-per-role.csv': makeCsv(function (query) {
			return queryHandler.resolve(query)(resolveTimePerRole)(function (data) {
				return timePerRoleCsv(data, rendererConfig);
			});
		}),
		'get-time-per-person': function (query) {
			return queryHandler.resolve(query)(resolveTimePerPerson);
		},
		'time-per-person.pdf': makePdf(function (query) {
			return queryHandler.resolve(query)(resolveTimePerPerson)(function (data) {
				return timePerPersonPrint(data, rendererConfig);
			});
		}),
		'get-dashboard-data': function (query) {
			return queryHandler.resolve(query)(function (query) {
				return getData(driver, processingStepsMeta)(function (data) {
					var lastDateQuery = assign({}, query, { dateFrom: null, dateTo: null,
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
							steps: reduceSteps(filterSteps(data.steps, query, processingStepsMeta),
								processingStepsMeta).byStepAndService,
							businessProcesses:
								reduceBusinessProcesses(filterBusinessProcesses(data.businessProcesses, query))
						},
						lastDateData: reduceSteps(filterSteps(data.steps, lastDateQuery, processingStepsMeta),
							processingStepsMeta).byStep
					};
					if (customChartsController) customChartsController(query, result, lastDateQuery);
					return result;
				});
			});
		}
	}, getBaseRoutes());
};
