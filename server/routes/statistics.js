'use strict';

var assign = require('es5-ext/object/assign')
  , ensureCallable = require('es5-ext/object/valid-callable')
  , ensureObject = require('es5-ext/object/valid-object')
  , ensureNumber = require('es5-ext/object/ensure-natural-number-value')
  , oForEach = require('es5-ext/object/for-each')
  , startsWith = require('es5-ext/string/#/starts-with')
  , deferred = require('deferred')
  , ensureDriver = require('dbjs-persistence/ensure-driver')
  , db = require('../../db')
  , QueryHandler = require('../../utils/query-handler')
  , toDateInTz = require('../../utils/to-date-in-time-zone')
  , anyIdToStorage = require('../utils/any-id-to-storage')
  , getData = require('../business-process-query/get-data')
  , filterSteps = require('../business-process-query/steps/filter')
  , filterBusinessProcesses = require('../business-process-query/business-processes/filter')
  , reduceSteps = require('../business-process-query/steps/reduce-time')
  , reduceBusinessProcesses = require('../business-process-query/business-processes/reduce-time')
  , getStatusHistoryDateMap = require('../business-process-query/get-status-history-date-map')
  , calculateStatusEventsSums = require('../services/calculate-status-events-sums')
  , getQueryHandlerConf = require('../../apps/statistics/get-query-conf')
  , flowQueryHandlerConf = require('../../apps/statistics/flow-query-conf')
  , rejectionsQueryHandlerConf = require('../../apps/statistics/rejections-query-conf')
  , timePerPersonPrint = require('../pdf-renderers/statistics-time-per-person')
  , timePerRolePrint = require('../pdf-renderers/statistics-time-per-role')
  , issuedCertificatesPrint = require('../pdf-renderers/statistics-issued-certificates')
  , issuedCertficatesCsv = require('../csv-renderers/statistics-issued-certificates')
  , flowCertificatesPrint = require('../pdf-renderers/statistics-flow-certificates')
  , flowRolesPrint = require('../pdf-renderers/statistics-flow-roles')
  , flowOperatorsPrint = require('../pdf-renderers/statistics-flow-operators')
  , flowRejectionsPrint = require('../pdf-renderers/statistics-flow-rejections')
  , timePerRoleCsv = require('../csv-renderers/statistics-time-per-role')
  , flowCertificatesCsv = require('../csv-renderers/statistics-flow-certificates')
  , flowRolesCsv = require('../csv-renderers/statistics-flow-roles')
  , flowOperatorsCsv = require('../csv-renderers/statistics-flow-operators')
  , flowRejectionsCsv = require('../csv-renderers/statistics-flow-rejections')
  , makePdf = require('./utils/pdf')
  , makeCsv = require('./utils/csv')
  , getBaseRoutes = require('./authenticated')
  , processingStepsMeta = require('../../processing-steps-meta')
  , getDateRangesByMode = require('../../utils/get-date-ranges-by-mode')
  , getStepLabelByShortPath = require('../../utils/get-step-label-by-short-path')
  , parseRejectionsForView = require('../../utils/statistics-flow-rejection-reason-results')
  , modes = require('../../utils/statistics-flow-group-modes')
  , flowCertificatesFilter = require('../../utils/statistics-flow-certificates-filter-result')
  , flowRolesFilter = require('../../utils/statistics-flow-roles-filter-result')
  , flowReduceOperators = require('../../utils/statistics-flow-reduce-operators')
  , flowRolesReduceSteps = require('../../utils/statistics-flow-reduce-processing-step')
  , itemsPerPage = require('../../conf/objects-list-unlimited-items-per-page')
  , flowQueryOperatorsHandlerConf = require('../../apps/statistics/flow-query-operators-conf')
  , getRejectionReasons = require('../mongo-queries/get-rejection-reasons')
  , getStatusHistory = require('../mongo-queries/get-status-history')
  , getProcessingWorkingHoursTime = require('../../utils/get-processing-working-hours-time')
  , capitalize = require('es5-ext/string/#/capitalize')
  , resolveFullStepPath = require('../../utils/resolve-processing-step-full-path')
  , _ = require('mano').i18n
  , getTimeItemTemplate = require('./utils/get-time-template')
  , accumulateProcessingTimeItems = require('./utils/accumulate-processing-time-items')
  , resolveTimePerPerson = require('./utils/resolve-time-per-person')
  , processingStepsMetaWithoutFrontDesk =
		require('../../utils/processing-steps-meta-without-front-desk')()
  , uncapitalize = require('es5-ext/string/#/uncapitalize');

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

var certificatesApprovedPrintConf = [
	require('../../apps-common/query-conf/date-from'),
	require('../../apps-common/query-conf/date-to')
];

var calculatePerDateStatusEventsSums = function (query) {
	var result = {}
	  , mode = modes.get(query.mode)
	  , total;

	if (query.noTotal) {
		total = deferred(null);
	} else {
		total = calculateStatusEventsSums(query.dateFrom, query.dateTo)(function (data) {
			result[_("Total")] = data;
		});
	}
	// get total
	return total.then(function () {
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
				// ' ' is to ensure numeric key (in the case of year) will not go in front of "Total" 
				result[dateRangeResult.displayKey + ' '] = dateRangeResult.data;
			});
		})(result);
	});
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

var getPeriods = function () {
	var periods = ['inPeriod', 'today', 'thisWeek', 'thisMonth']
	  , today = toDateInTz(new Date(), db.timeZone)
	  , currentYear = new db.Date(today.getUTCFullYear(), 0, 1)
	  , lastYearInRange = new db.Date(today.getUTCFullYear() - 5, 0, 1);

	while (currentYear >= lastYearInRange) {
		periods.push(currentYear.getUTCFullYear());
		currentYear.setUTCFullYear(currentYear.getUTCFullYear() - 1);
	}

	return periods;
};

var getPeriodsWithData = function (query) {
	var today = toDateInTz(new Date(), db.timeZone)
	  , periods = {};

	return deferred.map(getPeriods(), function (key) {
		periods[key] = null;
		if (key === 'thisMonth') {
			return calculateStatusEventsSums(new db.Date(today.getUTCFullYear(),
				today.getUTCMonth(), 1), query.dateTo).then(function (res) {
				periods[key] = res;
			});
		}
		if (key === 'thisWeek') {
			return calculateStatusEventsSums(new db.Date(today.getUTCFullYear(),
				today.getUTCMonth(),
				today.getUTCDate() - ((6 + today.getUTCDay()) % 7)),
				query.dateTo).then(function (res) {
				periods[key] = res;
			});
		}
		if (key === 'today') {
			return calculateStatusEventsSums(today, today).then(function (res) {
				periods[key] = res;
			});
		}
		if (key === 'inPeriod') {
			return calculateStatusEventsSums(query.dateFrom,
				query.dateTo).then(function (res) {
				periods[key] = res;
			});
		}
		var currentYear = new db.Date(key, 0, 1);
		return calculateStatusEventsSums(
			currentYear,
			new db.Date(currentYear.getUTCFullYear(), 11, 31)
		).then(function (res) {
			periods[key] = res;
		});
	}).then(function () {
		return periods;
	});
};

var getRejectableSteps = function () {
	var steps = {};
	Object.keys(processingStepsMeta).forEach(function (key) {
		if ((Object.keys(processingStepsMeta[key]).indexOf('rejected') !== -1) ||
				(Object.keys(processingStepsMeta[key]).indexOf('sentBack') !== -1)) {
			steps[key] = processingStepsMeta[key];
		}
	});

	return steps;
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
	var certificatesApprovedPrintHandler = new QueryHandler(certificatesApprovedPrintConf);

	var getFilesCompleted = function (query) {
		return getPeriodsWithData(query).then(function (periods) {
			// Apply formatting to match view table format
			var result = {
				byService: {},
				total: {}
			};

			oForEach(periods, function (periodData, periodName) {
				db.BusinessProcess.extensions.forEach(function (BpType) {
					var serviceName =
						uncapitalize.call(BpType.__id__.replace('BusinessProcess', ''));
					var resultServiceData = result.byService[serviceName];
					if (!resultServiceData) {
						resultServiceData = result.byService[serviceName] = {};
					}
					var count = (periodData[serviceName] && periodData[serviceName].businessProcess &&
						periodData[serviceName].businessProcess.atPickupWithdrawnOrClosed) || 0;
					resultServiceData[periodName] = count;
					if (!result.total[periodName]) {
						result.total[periodName] = 0;
					}
					result.total[periodName] += count;
				});
			});

			return result;
		});
	};

	/*
		Produces the following:

		[
			{
				service: { label: 'My bp' },
				data: [
					{
						period: 'thisYear',
						certificate: { abbr: 'ABBR', label: 'My certificate' },
						amount: 5
					}, {...}
				]
			}
		]
	*/

	var getApprovedCerts = function (query) {
		var approvedCertsResult = [];
		return getPeriodsWithData(query).then(function (periods) {
			db.BusinessProcess.extensions.forEach(function (BpType) {
				var serviceName =
					uncapitalize.call(BpType.__id__.replace('BusinessProcess', '')), currentItem;
				currentItem = { service: { label: BpType.prototype.label }, data: [] };
				approvedCertsResult.push(currentItem);
				BpType.prototype.certificates.ordered.forEach(function (cert) {
					getPeriods().forEach(function (key) {
						var currentDataItem = {
							period: key,
							certificate: { abbr: cert.abbr, label: cert.label,
								categoryLabel: cert.certificateCategory.label },
							amount: 0
						};
						if (periods[key][serviceName] &&
								periods[key][serviceName].certificate &&
								periods[key][serviceName].certificate[cert.key] &&
								periods[key][serviceName].certificate[cert.key].approved) {
							currentDataItem.amount = periods[key][serviceName].certificate[cert.key].approved;
						}
						currentItem.data.push(currentDataItem);
					});
				});
			});

			return approvedCertsResult;
		});
	};

	var getCertificatesIssuedData = function (query) {
		return getApprovedCerts(query).then(function (res) {
			var result = [], currentItem;
			res.forEach(function (serviceItem) {
				currentItem = { data: [] };
				currentItem.header = serviceItem.service.label;
				serviceItem.data.forEach(function (certItem) {
					if (certItem.period !== 'inPeriod') return;
					currentItem.data.push([
						certItem.certificate.categoryLabel,
						certItem.certificate.label,
						certItem.amount
					]);
				});
				result.push(currentItem);
			});
			return result;
		});
	};

	var getPandingToNonPendingCount = function (query) {
		var result = {};
		Object.keys(getRejectableSteps()).forEach(function (stepKey) {
			result['processingSteps/map/' + resolveFullStepPath(stepKey)] = {
				all: 0,
				sentBack: 0,
				rejected: 0,
				label: getStepLabelByShortPath(stepKey)
			};
		});
		return getStatusHistory.find({
			dateFrom: query.dateFrom,
			dateTo: query.dateTo,
			service: query.service,
			steps: Object.keys(getRejectableSteps()).map(function (stepKey) {
				return 'processingSteps/map/' + resolveFullStepPath(stepKey);
			}),
			sort: {
				'service.businessName': 1,
				'service.id': 1,
				'processingStep.path': 1,
				'date.ts': 1
			}
		}).then(function (entries) {
			entries.forEach(function (entry) {
				if (entry.status.code === 'sentBack' || entry.status.code === 'rejected') {
					result[entry.processingStep.path][entry.status.code]++;
				}
				if (entry.status.code !== 'pending') {
					result[entry.processingStep.path].all++;
				}
			});
			return result;
		});
	};

	var getApprovedByRoleWithTimes = function (query) {
		var result = {};
		Object.keys(processingStepsMetaWithoutFrontDesk).forEach(function (stepKey) {
			var stepPath = 'processingSteps/map/' + resolveFullStepPath(stepKey);
			result[stepPath] = {
				label: getStepLabelByShortPath(stepKey),
				services: {}
			};
			processingStepsMetaWithoutFrontDesk[stepKey]._services.forEach(function (serviceName) {
				var BusinessProcess = db['BusinessProcess' + capitalize.call(serviceName)];
				result[stepPath].services[BusinessProcess.__id__] =
						{ count: 0, timedCount: 0, processingTime: 0,
							countLessThanHour: 0, countBetweenHourAnd5Hours: 0, countOver5Hours: 0,
							avgTime: 0, label: BusinessProcess.prototype.label };
			});
		});
		var dateFrom = Number(db.Date(query.dateFrom || 0));
		return getStatusHistory.find({
			// don't take date from, as we want to see the whole history
			dateTo: query.dateTo,
			service: query.service,
			steps: Object.keys(processingStepsMetaWithoutFrontDesk).map(function (stepKey) {
				return 'processingSteps/map/' + resolveFullStepPath(stepKey);
			}),
			sort: {
				'service.businessName': 1,
				'service.id': 1,
				'processingStep.path': 1,
				'date.ts': 1
			}
		}).then(function (entries) {
			var currentEntry = null;
			entries.forEach(function (entry) {
				if (entry.status.code === 'pending') {
					if (currentEntry && currentEntry.service.id === entry.service.id &&
							entry.processingStep.path === currentEntry.processingStep.path) {
						currentEntry.date.ts = entry.date.ts;
					} else {
						currentEntry = assign({}, entry, { processingTime: 0 });
					}
				} else {
					var resultEntry =
							result[entry.processingStep.path].services[entry.service.type];
					// We count all approved, even if processingTime cannot be computed reliably
					if (entry.status.code === 'approved' && entry.date.ts >= dateFrom) {
						resultEntry.count++;
					}
					if (!currentEntry) return;
					if (currentEntry.service.id !== entry.service.id) return;
					if (currentEntry.processingStep.path !== entry.processingStep.path) return;
					currentEntry.processingTime +=
						getProcessingWorkingHoursTime(currentEntry.date.ts, entry.date.ts);

					if (entry.status.code === 'approved' && entry.date.ts >= dateFrom) {
						resultEntry.timedCount++;
						resultEntry.processingTime += currentEntry.processingTime;
						if (resultEntry.processingTime < 3600000) {
							resultEntry.countLessThanHour++;
						} else if (resultEntry.processingTime > 18000000) {
							resultEntry.countOver5Hours++;
						} else {
							resultEntry.countBetweenHourAnd5Hours++;
						}
						resultEntry.avgTime = resultEntry.processingTime / resultEntry.timedCount;
						currentEntry = null;
					}
				}
			});
			return result;
		});
	};

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
		stepsResult.totalCorrections.label = _("Corrections by the users");
		stepsResult.totalCorrections.processingPeriods = [];
		stepsResult.totalWithoutCorrections = getTimeItemTemplate();
		stepsResult.totalWithoutCorrections.label =
			_("Total processing periods without corrections");
		stepsResult.totalProcessing = getTimeItemTemplate();
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
				'service.id': 1,
				'processingStep.path': 1,
				'date.ts': 1
			}
		}).then(function (statusHistory) {
			var currentItem, step, currentSendBackItem;
			statusHistory.forEach(function (statusHistoryItem) {
				if (statusHistoryItem.status.code === 'pending') {
					currentItem = { bpId: statusHistoryItem.service.id };
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
						stepsResult.totalCorrections.processingPeriods.push(currentSendBackItem);

						currentSendBackItem = null;
					}
				} else if (currentItem) {
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
						currentSendBackItem = {
							bpId: statusHistoryItem.service.id,
							processingStart: statusHistoryItem.date.ts
						};
					}
					currentItem = null;
				}
			});

			return stepsResult;
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
			return calculatePerDateStatusEventsSums(
				assign({ noTotal: !query.processor }, query)
			)(function (result) {
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

				return renderer(finalResult, assign({
					mode: query.mode,
					step: getStepLabelByShortPath(query.step)
				}, rendererConfig));
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
		'get-certificates-issued-data': function (query) {
			return queryHandler.resolve(query)(getCertificatesIssuedData);
		},
		'certificates-issued.pdf':  makePdf(function (unresolvedQuery) {
			return certificatesApprovedPrintHandler.resolve(unresolvedQuery)
				.then(getCertificatesIssuedData).then(function (data) {
					return issuedCertificatesPrint(data, rendererConfig);
				});
		}),
		'certificates-issued.csv':  makeCsv(function (unresolvedQuery) {
			return certificatesApprovedPrintHandler.resolve(unresolvedQuery)
				.then(getCertificatesIssuedData).then(function (data) {
					return issuedCertficatesCsv(data, rendererConfig);
				});
		}),
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
				return calculatePerDateStatusEventsSums(
					assign({ noTotal: !query.processor }, query)
				)(function (result) {
					var finalResult = {}
					  , page = Number(query.page)
					  , itemsCnt = 0
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
		'get-dashboard-data': function (query) {
			var result = {};
			return queryHandler.resolve(query).then(function (resolvedQuery) {
				return deferred(
					getCertificatesIssuedData(resolvedQuery).then(function (res) {
						result.certificatesIssued = res;
						return result;
					}),
					getPandingToNonPendingCount(resolvedQuery).then(function (res) {
						result.pendingToNonPendingCount = res;
						return result;
					}),
					getApprovedByRoleWithTimes(resolvedQuery).then(function (res) {
						result.approvedByRoleWithTimes = res;
						return result;
					})
				)(result);
			});
		},
		'get-dashboard-old-data': function (query) {
			return queryHandler.resolve(query)(function (query) {
				return getData(driver)(function (data) {
					var lastDateQuery = assign({}, query, {
						dateFrom: null,
						dateTo: null,
						pendingAt: query.dateTo || toDateInTz(new Date(), db.timeZone)
					}), result = {};
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
					var chartsResult = {
						dateRangeData: {
							steps: reduceSteps(filterSteps(data, query), { mode: 'full' }).byStepAndService,
							businessProcesses: reduceBusinessProcesses(
								filterBusinessProcesses(data.businessProcesses,
									assign({ flowStatus: 'submitted' }, query))
							)
						},
						lastDateData: reduceSteps(filterSteps(data, lastDateQuery), { mode: 'full' }).byStep
					};
					if (customChartsController) customChartsController(query, chartsResult, lastDateQuery);
					result.chartsResult   = chartsResult;
					return getFilesCompleted(query).then(function (res) {
						result.filesCompleted = res;
						return deferred(true);
					}).then(function () {
						return getApprovedCerts(query).then(function (res) {
							var approvedCertsData = [], row, nextIndex, totalRow;
							totalRow = [_("Total")];
							res.forEach(function (serviceItem) {
								nextIndex = 0;
								serviceItem.data.forEach(function (certItem, index) {
									if (index < nextIndex) return;
									row = [serviceItem.service.label, certItem.certificate.abbr];
									getPeriods().forEach(function (period, periodIndex) {
										if (!totalRow[periodIndex + 1]) {
											totalRow[periodIndex + 1] = 0;
										}
										row.push(serviceItem.data[index + periodIndex].amount);
										totalRow[periodIndex + 1] +=
											serviceItem.data[index + periodIndex].amount;
										nextIndex = index + periodIndex + 1;
									});
									approvedCertsData.push(row);
								});
							});
							approvedCertsData.push(totalRow);
							result.approvedCertsData = approvedCertsData;
							return result;
						});
					});
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
