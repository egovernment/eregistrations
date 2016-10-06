'use strict';

var assign                  = require('es5-ext/object/assign')
  , ensureCallable          = require('es5-ext/object/valid-callable')
  , ensureObject            = require('es5-ext/object/valid-object')
  , oForEach                = require('es5-ext/object/for-each')
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
			stepsResult = reduceSteps(filterSteps(data, query, processingStepsMeta),
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
			data = reduceSteps(filterSteps(data, query, processingStepsMeta), processingStepsMeta);
			return { byStep: data.byStep, byStepAndProcessor: data.byStepAndProcessor };
		});
	};

	var rendererConfig = {
		processingStepsMeta: processingStepsMeta,
		logo: config.logo
	};

	// Initialize data map
	getData(driver, processingStepsMeta).done();

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
		'get-files-completed': function (query) {
			// We need:
			// businessProcesses | filter(approved) | reduceCompletedBusinessProcesses().today
			// Spec of data needed:
			// # Files completed since system launch
			//   businessProcesses | filter(approved) | reduce() |
			// # Files completed this year
			//   businessProcesses | filter(approved, { dateFrom: this-year }) | reduce()
			// # Files completed this month
			//   businessProcesses | filter(approved, { dateFrom: this-month }) | reduce()
			var approvedQuery = { flowStatus: 'approved' }
			  , today         = toDateInTz(new Date(), db.timeZone);

			return queryHandler.resolve(query)(function (query) {
				return getData(driver, processingStepsMeta)(function (data) {
					return {
						sinceLaunch: reduceBusinessProcesses(filterBusinessProcesses(
							data.businessProcesses,
							approvedQuery
						)),
						thisYear: reduceBusinessProcesses(filterBusinessProcesses(
							data.businessProcesses,
							assign({
								dateFrom: new db.Date(today.getUTCFullYear(), 0, 1)
							}, approvedQuery)
						)),
						thisMonth: reduceBusinessProcesses(filterBusinessProcesses(
							data.businessProcesses,
							assign({
								dateFrom: new db.Date(today.getUTCFullYear(), today.getUTCMonth(), 1)
							}, approvedQuery)
						)),
						thisWeek: reduceBusinessProcesses(filterBusinessProcesses(
							data.businessProcesses,
							assign({
								dateFrom: new db.Date(today.getUTCFullYear(), today.getUTCMonth(),
									(6 + today.getUTCDay()) % 7)
							}, approvedQuery)
						)),
						today: reduceBusinessProcesses(filterBusinessProcesses(
							data.businessProcesses,
							assign({ dateFrom: today }, approvedQuery)
						)),
						inPeriod: reduceBusinessProcesses(filterBusinessProcesses(
							data.businessProcesses,
							assign({}, approvedQuery, query)
						))
					};
				});
			})(function (data) {
				// Apply formatting to match view table format
				var result = {
					sinceLaunch: { total: 0, byService: {} },
					thisYear: { total: 0, byService: {} },
					thisMonth: { total: 0, byService: {} },
					thisWeek: { total: 0, byService: {} },
					today: { total: 0, byService: {} },
					inPeriod: { total: 0, byService: {} }
				};

				oForEach(data, function (periodData, periodName) {
					result[periodName].total = periodData.all.startedCount;
					oForEach(periodData.byService, function (serviceData, serviceName) {
						result[periodName].byService[serviceName] = serviceData.startedCount;
					});
				});

				return result;
			});
		},
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
							steps: reduceSteps(filterSteps(data, query, processingStepsMeta),
								processingStepsMeta).byStepAndService,
							businessProcesses: reduceBusinessProcesses(
								filterBusinessProcesses(data.businessProcesses,
									assign({ flowStatus: 'submitted' }, query))
							)
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
