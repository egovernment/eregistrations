'use strict';

var assign                     = require('es5-ext/object/assign')
  , ensureCallable             = require('es5-ext/object/valid-callable')
  , ensureObject               = require('es5-ext/object/valid-object')
  , ensureNumber               = require('es5-ext/object/ensure-natural-number-value')
  , oForEach                   = require('es5-ext/object/for-each')
  , startsWith                 = require('es5-ext/string/#/starts-with')
  , deferred                   = require('deferred')
  , ensureDriver               = require('dbjs-persistence/ensure-driver')
  , db                         = require('../../db')
  , QueryHandler               = require('../../utils/query-handler')
  , toDateInTz                 = require('../../utils/to-date-in-time-zone')
  , anyIdToStorage             = require('../utils/any-id-to-storage')
  , getData                    = require('../business-process-query/get-data')
  , filterSteps                = require('../business-process-query/steps/filter')
  , filterBusinessProcesses    = require('../business-process-query/business-processes/filter')
  , reduceSteps                = require('../business-process-query/steps/reduce-time')
  , reduceBusinessProcesses    = require('../business-process-query/business-processes/reduce-time')
  , getStatusHistoryDateMap    = require('../business-process-query/get-status-history-date-map')
  , calculateStatusEventsSums  = require('../services/calculate-status-events-sums')
  , getQueryHandlerConf        = require('../../apps/statistics/get-query-conf')
  , flowQueryHandlerConf       = require('../../apps/statistics/flow-query-conf')
  , rejectionsQueryHandlerConf = require('../../apps/statistics/rejections-query-conf')
  , timePerPersonPrint         = require('../pdf-renderers/statistics-time-per-person')
  , timePerRolePrint           = require('../pdf-renderers/statistics-time-per-role')
  , flowCertificatesPrint      = require('../pdf-renderers/statistics-flow-certificates')
  , flowRolesPrint             = require('../pdf-renderers/statistics-flow-roles')
  , flowOperatorsPrint         = require('../pdf-renderers/statistics-flow-operators')
  , flowRejectionsPrint        = require('../pdf-renderers/statistics-flow-rejections')
  , timePerRoleCsv             = require('../csv-renderers/statistics-time-per-role')
  , flowCertificatesCsv        = require('../csv-renderers/statistics-flow-certificates')
  , flowRolesCsv               = require('../csv-renderers/statistics-flow-roles')
  , flowOperatorsCsv           = require('../csv-renderers/statistics-flow-operators')
  , flowRejectionsCsv          = require('../csv-renderers/statistics-flow-rejections')
  , makePdf                    = require('./utils/pdf')
  , makeCsv                    = require('./utils/csv')
  , getBaseRoutes              = require('./authenticated')
  , processingStepsMeta        = require('../../processing-steps-meta')
  , getDateRangesByMode        = require('../../utils/get-date-ranges-by-mode')
  , getStepLabelByShortPath    = require('../../utils/get-step-label-by-short-path')
  , parseRejectionsForView     = require('../../utils/statistics-flow-rejection-reason-results')
  , modes                      = require('../../utils/statistics-flow-group-modes')
  , flowCertificatesFilter     = require('../../utils/statistics-flow-certificates-filter-result')
  , flowRolesFilter            = require('../../utils/statistics-flow-roles-filter-result')
  , flowReduceOperators        = require('../../utils/statistics-flow-reduce-operators')
  , flowRolesReduceSteps       = require('../../utils/statistics-flow-reduce-processing-step')
  , itemsPerPage               = require('../../conf/objects-list-items-per-page')
  , flowQueryOperatorsHandlerConf = require('../../apps/statistics/flow-query-operators-conf')
  , getRejectionReasons           = require('../mongo-queries/get-rejection-reasons')
  , getStatusHistory              = require('../mongo-queries/get-status-history')
  , getProcessingWorkingHoursTime = require('../../utils/get-processing-working-hours-time')
  , capitalize                    = require('es5-ext/string/#/capitalize')
  , resolveFullStepPath  = require('../../utils/resolve-processing-step-full-path')
  , _                    = require('mano').i18n
  , processingStepsMetaWithoutFrontDesk =
		require('../../utils/processing-steps-meta-without-front-desk')();

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

var businessProcessQueryHandler = new QueryHandler([{
	name: 'id',
	ensure: function (value) {
		if (!value) throw new Error("Missing id");
		return anyIdToStorage(value)(function (storage) {
			if (!storage) return null;
			if (!startsWith.call(storage.name, 'businessProcess')) return null;
			return value;
		});
	}
}]);

var getTimeItemTemplate = function () {
	return {
		timedCount: 0,
		maxTime: -Infinity,
		minTime: Infinity,
		totalTime: 0,
		avgTime: 0
	};
};

var accumulateProcessingTimeItems = function (collection, item) {
	collection.timedCount++;
	collection.totalTime += item.processingTime;
	collection.minTime =
		Math.min(collection.minTime, item.processingTime);
	collection.maxTime =
		Math.max(collection.maxTime, item.processingTime);
	collection.avgTime =
		Math.round(collection.totalTime
			/ collection.timedCount);
};

module.exports = function (config) {
	var driver = ensureDriver(ensureObject(config).driver)
	  , customChartsController;

	if (config.customChartsController) {
		customChartsController = ensureCallable(config.customChartsController);
	}
	var queryConf = getQueryHandlerConf({ processingStepsMeta: processingStepsMeta });

	var queryHandler = new QueryHandler(queryConf);
	var flowQueryHandler = new QueryHandler(flowQueryHandlerConf);
	var flowQueryCertificatesPrintHandler = new QueryHandler(flowQueryHandlerCertificatesPrintConf);
	var flowQueryRolesPrintHandler = new QueryHandler(flowQueryHandlerRolesPrintConf);
	var flowQueryHandlerOperators = new QueryHandler(flowQueryOperatorsHandlerConf);
	var rejectionsQueryHandler = new QueryHandler(rejectionsQueryHandlerConf);

	var resolveTimePerRole = function (query) {
		var stepsResult = {};
		Object.keys(processingStepsMetaWithoutFrontDesk).forEach(function (stepShortPath) {
			stepsResult[stepShortPath] = {};
			stepsResult[stepShortPath].label = db['BusinessProcess' +
				capitalize.call(processingStepsMeta[stepShortPath]._services[0])].prototype
				.processingSteps.map.getBySKeyPath(resolveFullStepPath(stepShortPath)).label;

			stepsResult[stepShortPath].processingPeriods = [];
			stepsResult[stepShortPath].processing = getTimeItemTemplate();
		});
		stepsResult.totalCorrections = getTimeItemTemplate();
		stepsResult.totalCorrections.label =
			_("Total correction periods");
		stepsResult.totalCorrectionsByUser = getTimeItemTemplate();
		stepsResult.totalWithoutCorrections = getTimeItemTemplate();
		stepsResult.totalWithoutCorrections.label =
			_("Total processing periods without corrections");
		stepsResult.totalProcessing  = getTimeItemTemplate();
		stepsResult.totalProcessing.label =
			_("Total processing periods");

		return getStatusHistory.find({
			onlyFullItems: true,
			dateFrom: query.dateFrom,
			dateTo: query.dateTo,
			service: query.service,
			excludeFrontDesk: true,
			sort: {
				'service.businessName': 1,
				'date.ts': 1
			}
		}).then(function (statusHistory) {
			var currentItem, step, currentSendBackItem;
			statusHistory.forEach(function (statusHistoryItem) {
				if (!currentItem) {
					currentItem = { bpId: statusHistoryItem.service.id };
				}

				if (statusHistoryItem.status.code === 'pending') {
					currentItem.processingStart = statusHistoryItem.date.ts;

					if (currentSendBackItem) {
						if (currentSendBackItem.processingStart > statusHistoryItem.date.ts
								|| !currentSendBackItem.processingStart ||
								currentSendBackItem.bpId !== statusHistoryItem.service.id) {
							currentSendBackItem = null;
							return;
						}
						currentSendBackItem.processingEnd = statusHistoryItem.date.ts;
						currentSendBackItem.businessName = statusHistoryItem.service.businessName;
						currentSendBackItem.processingTime =
							getProcessingWorkingHoursTime(currentSendBackItem.processingStart,
								currentSendBackItem.processingEnd);
						currentSendBackItem.processor = statusHistoryItem.operator.name;
						accumulateProcessingTimeItems(stepsResult.totalCorrections, currentSendBackItem);
						accumulateProcessingTimeItems(stepsResult.totalProcessing, currentSendBackItem);

						currentSendBackItem = null;
					}
				} else {
					if (!db[statusHistoryItem.service.type]) {
						currentItem = null;
						return;
					}
					step =
						db[statusHistoryItem.service.type].prototype.resolveSKeyPath(
							statusHistoryItem.processingStep.path
						);
					if (step && step.value) {
						step = step.value;
					} else {
						currentItem = null;
						return;
					}
					if (currentItem.processingStart > statusHistoryItem.date.ts
							|| !currentItem.processingStart ||
							currentItem.bpId !== statusHistoryItem.service.id) {
						currentItem = null;
						return;
					}
					currentItem.processingEnd = statusHistoryItem.date.ts;
					currentItem.businessName = statusHistoryItem.service.businessName;
					currentItem.processingTime =
						getProcessingWorkingHoursTime(currentItem.processingStart, currentItem.processingEnd);
					currentItem.processor = statusHistoryItem.operator.name;
					var stepPath = step.key;
					if (!stepsResult[stepPath]) { // child of group step
						stepPath = step.owner.owner.owner.key + '/' + step.key;
					}
					stepsResult[stepPath].processingPeriods.push(currentItem);

					accumulateProcessingTimeItems(stepsResult[stepPath].processing, currentItem);
					accumulateProcessingTimeItems(stepsResult.totalProcessing, currentItem);
					accumulateProcessingTimeItems(stepsResult.totalWithoutCorrections, currentItem);

					if (statusHistoryItem.status.code === 'sentBack') {
						currentSendBackItem = { bpId: statusHistoryItem.service.id,
							processingStart: statusHistoryItem.date.ts };
					}
					currentItem = null;
				}
			});

			stepsResult.totalCorrectionsByUser = assign({}, stepsResult.totalCorrectionsByUser,
				stepsResult.totalCorrections, { label: _("Corrections by the users") });

			return stepsResult;
		});
	};

	var resolveTimePerPerson = function (query) {
		return getData(driver)(function (data) {
			// We need:
			// steps | filter(query) | reduce()[byStepAndProcessor, byStep]
			data = reduceSteps(filterSteps(data, query), { includeBusinessProcesses: true });
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

	var resolveRejectReasonOccurrence = function (query, reasons) {
		var match = { 'date.date': {} }
		  , groupBy = [{
			$group: {
				_id: {
					rejectionReasonsConcat: "$rejectionReasonsConcat"
				},
				count: {
					$sum: 1
				}
			}
		}];

		if (query.dateFrom) match['date.date'].$gte = Number(db.Date(query.dateFrom));
		if (query.dateTo) match['date.date'].$lte = Number(db.Date(query.dateTo));
		if (Object.keys(match['date.date']).length > 0) groupBy.unshift({ $match: match });

		return getRejectionReasons.group(groupBy)
			.then(function (groupedRejectionReasons) {
				return deferred.map(reasons, function (rejectionReason) {
					groupedRejectionReasons.some(function (groupedRejectionReason) {
						if (groupedRejectionReason._id.rejectionReasonsConcat
								=== rejectionReason.rejectionReasonsConcat) {
							rejectionReason.occurrencesCount = groupedRejectionReason.count;
							return true;
						}
					});
					return rejectionReason;
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
		'flow-certificates-data.csv': makeCsv(function (unresolvedQuery) {
			return resolveCertificatesDataPrint(unresolvedQuery, flowCertificatesCsv);
		}),
		'flow-roles-data.pdf': makePdf(function (unresolvedQuery) {
			return resolveRolesDataPrint(unresolvedQuery, flowRolesPrint);
		}),
		'flow-roles-data.csv': makeCsv(function (unresolvedQuery) {
			return resolveRolesDataPrint(unresolvedQuery, flowRolesCsv);
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
		'flow-roles-operators-data.csv': makeCsv(function (unresolvedQuery) {
			return resolveOperatorsDataPrint(unresolvedQuery, flowOperatorsCsv);
		}),
		'get-flow-rejections-data': function (unresolvedQuery) {
			var data = { rows: [] }, page, queryData;
			return rejectionsQueryHandler.resolve(unresolvedQuery)(function (query) {
				page = ensureNumber(query.page);
				queryData = query;
				return getRejectionReasons.count(queryData);
			}).then(function (count) {
				var portion = {};
				portion.offset = (page - 1) * itemsPerPage;
				if (page * itemsPerPage < count) portion.limit = itemsPerPage;
				data.pageCount = ensureNumber(Math.ceil(count / itemsPerPage));
				return getRejectionReasons.find(queryData, portion);
			}).then(function (reasons) {
				return resolveRejectReasonOccurrence(queryData, reasons);
			}).then(function (reasonsWithOccurrence) {
				data.rows = parseRejectionsForView(reasonsWithOccurrence, { useBpId: true });
				return data;
			});
		},
		'flow-rejections-data.pdf': makePdf(function (unresolvedQuery) {
			var queryData;
			return rejectionsQueryHandler.resolve(unresolvedQuery)(function (query) {
				queryData = query;
				return getRejectionReasons.find(queryData);
			}).then(function (reasons) {
				return resolveRejectReasonOccurrence(queryData, reasons);
			}).then(function (reasonsWithOccurrence) {
				return flowRejectionsPrint(parseRejectionsForView(reasonsWithOccurrence), rendererConfig);
			});
		}),
		'flow-rejections-data.csv': makeCsv(function (unresolvedQuery) {
			var queryData;
			return rejectionsQueryHandler.resolve(unresolvedQuery)(function (query) {
				queryData = query;
				return getRejectionReasons.find(queryData);
			}).then(function (reasons) {
				return resolveRejectReasonOccurrence(queryData, reasons);
			}).then(function (reasonsWithOccurrence) {
				return flowRejectionsCsv(parseRejectionsForView(reasonsWithOccurrence), rendererConfig);
			});
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
										today.getUTCDate() - ((6 + today.getUTCDay()) % 7))
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
							steps: reduceSteps(filterSteps(data, query), { mode: 'full' }).byStepAndService,
							businessProcesses: reduceBusinessProcesses(
								filterBusinessProcesses(data.businessProcesses,
									assign({ flowStatus: 'submitted' }, query))
							)
						},
						lastDateData: reduceSteps(filterSteps(data, lastDateQuery), { mode: 'full' }).byStep
					};
					if (customChartsController) customChartsController(query, result, lastDateQuery);
					return result;
				});
			});
		},
		'get-business-process-data': function (query) {
			// Get full data of one of the business processeses
			return businessProcessQueryHandler.resolve(query)(function (query) {
				var recordId;
				if (!query.id) return { passed: false };
				recordId = this.req.$user + '/recentlyVisited/businessProcesses/statistics*7' + query.id;
				return driver.getStorage('user').store(recordId, '11')({ passed: true });
			}.bind(this));
		}
	}, getBaseRoutes());
};
