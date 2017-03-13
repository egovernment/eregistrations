'use strict';

var assign                    = require('es5-ext/object/assign')
  , ensureCallable            = require('es5-ext/object/valid-callable')
  , ensureObject              = require('es5-ext/object/valid-object')
  , oForEach                  = require('es5-ext/object/for-each')
  , deferred                  = require('deferred')
  , ensureDriver              = require('dbjs-persistence/ensure-driver')
  , db                        = require('../../db')
  , QueryHandler              = require('../../utils/query-handler')
  , toDateInTz                = require('../../utils/to-date-in-time-zone')
  , getData                   = require('../business-process-query/get-data')
  , filterSteps               = require('../business-process-query/steps/filter')
  , filterBusinessProcesses   = require('../business-process-query/business-processes/filter')
  , reduceSteps               = require('../business-process-query/steps/reduce-time')
  , reduceBusinessProcesses   = require('../business-process-query/business-processes/reduce-time')
  , getStatusHistoryDateMap   = require('../business-process-query/get-status-history-date-map')
  , calculateStatusEventsSums = require('../services/calculate-status-events-sums')
  , getQueryHandlerConf       = require('../../apps/statistics/get-query-conf')
  , flowQueryHandlerConf      = require('../../apps/statistics/flow-query-conf')
  , timePerPersonPrint        = require('../pdf-renderers/statistics-time-per-person')
  , timePerRolePrint          = require('../pdf-renderers/statistics-time-per-role')
  , flowCertificatesPrint     = require('../pdf-renderers/statistics-flow-certificates')
  , flowRolesPrint            = require('../pdf-renderers/statistics-flow-roles')
  , flowOperatorsPrint        = require('../pdf-renderers/statistics-flow-operators')
  , timePerRoleCsv            = require('../csv-renderers/statistics-time-per-role')
  , makePdf                   = require('./utils/pdf')
  , makeCsv                   = require('./utils/csv')
  , getBaseRoutes             = require('./authenticated')
  , processingStepsMeta       = require('../../processing-steps-meta')
  , getDateRangesByMode       = require('../../utils/get-date-ranges-by-mode')
  , getStepLabelByShortPath   = require('../../utils/get-step-label-by-short-path')
  , modes                     = require('../../utils/statistics-flow-group-modes')
  , flowCertificatesFilter    = require('../../utils/statistics-flow-certificates-filter-result')
  , flowRolesFilter           = require('../../utils/statistics-flow-roles-filter-result')
  , flowReduceOperators       = require('../../utils/statistics-flow-reduce-operators')
  , flowRolesReduceSteps      = require('../../utils/statistics-flow-reduce-processing-step')
  , itemsPerPage              = require('../../conf/objects-list-items-per-page')
  , flowQueryOperatorsHandlerConf = require('../../apps/statistics/flow-query-operators-conf');

var flowQueryHandlerCertificatesPrintConf = [
	require('../../apps-common/query-conf/date-from'),
	require('../../apps-common/query-conf/date-to'),
	require('../../apps-common/query-conf/mode'),
	require('../../apps-common/query-conf/service'),
	require('../../apps-common/query-conf/certificate')
];

var flowQueryHandlerRolesPrintConf = [
	require('../../apps-common/query-conf/date-from'),
	require('../../apps-common/query-conf/date-to'),
	require('../../apps-common/query-conf/mode'),
	require('../../apps-common/query-conf/service'),
	require('../../apps-common/query-conf/certificate'),
	require('../../apps-common/query-conf/processing-step-status')
];

var calculatePerDateStatusEventsSums = function (query) {
	var result = {}
	  , mode   = modes.get(query.mode);

	return deferred.map(getDateRangesByMode(query.dateFrom, query.dateTo, query.mode),
		function (dateRange) {
			// dateRange: { dateFrom: db.Date, dateTo: db.Date } with dateRange query for result
			return calculateStatusEventsSums(dateRange.dateFrom, dateRange.dateTo)(function (data) {
				return {
					displayKey: mode.getDisplayedKey(dateRange.dateFrom),
					data: data
				};
			});
		})(function (dateRangeResults) {
		dateRangeResults.forEach(function (dateRangeResult) {
			result[dateRangeResult.displayKey] = dateRangeResult.data;
		});
	})(result);
};

module.exports = function (config) {
	var driver = ensureDriver(ensureObject(config).driver)
	  , customChartsController;

	if (config.customChartsController) {
		customChartsController = ensureCallable(config.customChartsController);
	}
	var queryConf = getQueryHandlerConf({ processingStepsMeta: processingStepsMeta });
	var flowQueryConf = flowQueryHandlerConf;
	var flowQueryCertificatesPrintConf = flowQueryHandlerCertificatesPrintConf;
	var flowQueryRolesPrintConf = flowQueryHandlerRolesPrintConf;

	var queryHandler = new QueryHandler(queryConf);
	var flowQueryHandler = new QueryHandler(flowQueryConf);
	var flowQueryCertificatesPrintHandler = new QueryHandler(flowQueryCertificatesPrintConf);
	var flowQueryRolesPrintHandler = new QueryHandler(flowQueryRolesPrintConf);
	var flowQueryHandlerOperators = new QueryHandler(flowQueryOperatorsHandlerConf);

	var resolveTimePerRole = function (query) {
		return getData(driver)(function (data) {
			var stepsResult;
			// We need:
			// steps | filter(query) | reduce()[byStep, all]
			// businessProcesses | filter(query) | reduce().all
			stepsResult = reduceSteps(filterSteps(data, query));
			return {
				steps: { byStep: stepsResult.byStep, all: stepsResult.all },
				businessProcesses: reduceBusinessProcesses(filterBusinessProcesses(data.businessProcesses,
					query)).all
			};
		});
	};

	var resolveTimePerPerson = function (query) {
		return getData(driver)(function (data) {
			// We need:
			// steps | filter(query) | reduce()[byStepAndProcessor, byStep]
			data = reduceSteps(filterSteps(data, query));
			return { byStep: data.byStep, byStepAndProcessor: data.byStepAndProcessor };
		});
	};

	var rendererConfig = {
		processingStepsMeta: processingStepsMeta,
		logo: config.logo
	};

	var resolveCertificatesDataPrint = function (unresolvedQuery, renderer) {
		return flowQueryCertificatesPrintHandler.resolve(unresolvedQuery)(function (query) {
			return calculatePerDateStatusEventsSums(query)(function (result) {
				return renderer(flowCertificatesFilter(result, query),
					assign({ mode: query.mode }, rendererConfig));
			});
		});
	};

	var resolveRolesDataPrint = function (unresolvedQuery, renderer) {
		return flowQueryRolesPrintHandler.resolve(unresolvedQuery)(function (query) {
			return calculatePerDateStatusEventsSums(query)(function (result) {
				return renderer(flowRolesFilter(flowRolesReduceSteps(result), query),
					assign({ mode: query.mode }, rendererConfig));
			});
		});
	};

	var resolveOperatorsDataPrint = function (unresolvedQuery, renderer) {
		return flowQueryHandlerOperators.resolve(unresolvedQuery)(function (query) {
			return calculatePerDateStatusEventsSums(query)(function (result) {
				var finalResult = {};

				result = flowReduceOperators(result, query);

				Object.keys(result).forEach(function (date) {
					Object.keys(result[date]).forEach(function (processorId) {
						if (!finalResult[date]) {
							finalResult[date] = {};
						}
						finalResult[date][processorId] = result[date][processorId];
					});
				});

				return renderer(finalResult, assign({ mode: query.mode,
					step: getStepLabelByShortPath(query.step) }, rendererConfig));
			});
		});
	};

	// Initialize data map.
	getData(driver).done();
	// Initialize status history date map.
	getStatusHistoryDateMap(driver).done();

	return assign({
		'get-flow-data': function (unresolvedQuery) {
			return flowQueryHandler.resolve(unresolvedQuery)(calculatePerDateStatusEventsSums);
		},
		'flow-certificates-data.pdf': makePdf(function (unresolvedQuery) {
			return resolveCertificatesDataPrint(unresolvedQuery, flowCertificatesPrint);
		}),
		'flow-roles-data.pdf': makePdf(function (unresolvedQuery) {
			return resolveRolesDataPrint(unresolvedQuery, flowRolesPrint);
		}),
		'get-flow-roles-operators-data': function (unresolvedQuery) {
			return flowQueryHandlerOperators.resolve(unresolvedQuery)(function (query) {
				return calculatePerDateStatusEventsSums(query)(function (result) {
					var finalResult = {}
					  , page        = Number(query.page)
					  , itemsCnt    = 0
					  , currentPage = 1;

					result = flowReduceOperators(result, query);

					Object.keys(result).forEach(function (date) {
						Object.keys(result[date]).forEach(function (processorId) {
							itemsCnt++;
							if ((itemsCnt % itemsPerPage) === 1 && itemsCnt > 1) {
								currentPage++;
							}
							if (currentPage === page) {
								if (!finalResult[date]) {
									finalResult[date] = {};
								}
								finalResult[date][processorId] = result[date][processorId];
							}
						});
					});

					return { data: finalResult, pageCount: currentPage };
				});
			});
		},
		'flow-roles-operators-data.pdf': makePdf(function (unresolvedQuery) {
			return resolveOperatorsDataPrint(unresolvedQuery, flowOperatorsPrint);
		}),
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
			// Spec of data needed:
			// # Files completed since system launch
			//   businessProcesses | filter(approved) | reduce()[all, byService]
			// # Files completed this year
			//   businessProcesses | filter(approvedThisYear) | reduce()[all, byService]
			// # Files completed this month
			//   businessProcesses | filter(approvedThisMonth) | reduce()[all, byService]
			// # Files completed this week
			//   businessProcesses | filter(approvedThisWeek) | reduce()[all, byService]
			// # Files completed today
			//   businessProcesses | filter(approvedToday) | reduce()[all, byService]
			// # Files completed in given period
			//   businessProcesses | filter(approvedAtQueryDateRange) | reduce()[all, byService]
			var approvedQuery = { flowStatus: 'approved' }
			  , today         = toDateInTz(new Date(), db.timeZone);

			return queryHandler.resolve(query)(function (query) {
				return getData(driver)(function (data) {
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
					byService: {},
					total: {}
				};

				oForEach(data, function (periodData, periodName) {
					result.total[periodName] = periodData.all.startedCount;

					oForEach(periodData.byService, function (serviceData, serviceName) {
						var resultServiceData = result.byService[serviceName];

						if (!resultServiceData) {
							resultServiceData = result.byService[serviceName] = {};
						}

						resultServiceData[periodName] = serviceData.startedCount;
					});
				});

				return result;
			});
		},
		'get-dashboard-data': function (query) {
			return queryHandler.resolve(query)(function (query) {
				return getData(driver)(function (data) {
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
							steps: reduceSteps(filterSteps(data, query)).byStepAndService,
							businessProcesses: reduceBusinessProcesses(
								filterBusinessProcesses(data.businessProcesses,
									assign({ flowStatus: 'submitted' }, query))
							)
						},
						lastDateData: reduceSteps(filterSteps(data, lastDateQuery)).byStep
					};
					if (customChartsController) customChartsController(query, result, lastDateQuery);
					return result;
				});
			});
		}
	}, getBaseRoutes());
};
