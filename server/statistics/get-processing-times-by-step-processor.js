'use strict';

var includes                         = require('es5-ext/array/#/contains')
  , assign                           = require('es5-ext/object/assign')
  , normalizeOptions                 = require('es5-ext/object/normalize-options')
  , getClosedProcessingStepsStatuses = require('./get-closed-processing-steps-statuses')
  , ensureDriver                     = require('dbjs-persistence/ensure-driver')
  , ensureDatabase                   = require('dbjs/valid-dbjs')
  , ensureObject                     = require('es5-ext/object/valid-object')
  , ensureCallable                   = require('es5-ext/object/valid-callable')
  , deferred                         = require('deferred')
  , unserializeValue                 = require('dbjs/_setup/unserialize/value')
  , businessProcessesApprovedMap     = require('../utils/business-processes-approved-map')
  , memoize                          = require('memoizee');

var getEmptyData = function () {
	return {
		processed: 0,
		avgTime: 0,
		minTime: Infinity,
		maxTime: 0,
		totalTime: 0
	};
};

var getProcessorAndProcessingTime = memoize(function (data) {
	var result = {};
	return deferred(
		data.storage.get(data.id + '/' + data.stepFullPath + '/processor')(
			function (processorData) {
				if (!processorData || processorData.value[0] !== '7') return;
				result.processor = processorData.value.slice(1);
			}
		),
		data.storage.get(data.id + '/' + data.stepFullPath + '/correctionTime')(
			function (correctionTimeData) {
				if (!correctionTimeData || correctionTimeData.value[0] !== '2') return;
				result.correctionTime =
					unserializeValue(correctionTimeData.value);
			}
		),
		data.storage.get(data.id + '/' + data.stepFullPath + '/processingTime')(
			function (processingTimeData) {
				if (!processingTimeData || processingTimeData.value[0] !== '2') return;
				result.processingTime =
					unserializeValue(processingTimeData.value);
			}
		)
	)(result);
}, {
	normalizer: function (args) { return args[0].id + args[0].stepFullPath; },
	// One hour
	maxAge: 1000 * 60 * 60
});
/**
	*
	* @param data
	* driver                  - Database driver
	* processingStepsMeta     - map of processing steps
	* db                      - dbjs database
	* query (optional)        - query past from controller
	* customFilter (optional) - function used to filter by system specific parameters
	* @returns {Object}
*/
module.exports = function (data) {
	var result = {
		byBusinessProcess: {
			totalProcessing: null,
			totalCorrection: null,
			total: null,
			data: {}
		},
		byProcessor: {},
		stepTotal: {},
		byStepAndService: {},
		byService: {}
	},
	driver, processingStepsMeta, db, query, customFilter, options;
	result.byBusinessProcess.totalProcessing = getEmptyData();
	result.byBusinessProcess.totalCorrection = getEmptyData();
	result.byBusinessProcess.total           = getEmptyData();

	options             = normalizeOptions(ensureObject(data));
	driver              = ensureDriver(options.driver);
	processingStepsMeta = ensureObject(options.processingStepsMeta);
	db                  = ensureDatabase(options.db);
	if (options.query) {
		query = ensureObject(options.query);
	} else {
		query = {};
	}
	if (options.customFilter) {
		customFilter = ensureCallable(options.customFilter);
	}

	// 1. Get data for all processing steps from all services
	var promise = getClosedProcessingStepsStatuses(driver, processingStepsMeta, db);
	return promise(function (businessProcessesByStepsMap) {
		return deferred.map(Object.keys(businessProcessesByStepsMap), function (stepShortPath) {
			var entries = businessProcessesByStepsMap[stepShortPath];

			// 2. Filter by step
			if (query.step && query.step !== stepShortPath) return;

			// 3. Filter by service
			if (query.service) {
				if (!includes.call(processingStepsMeta[stepShortPath]._services, query.service)) {
					return;
				}
				if (processingStepsMeta[stepShortPath]._services.length > 1) {
					entries = businessProcessesByStepsMap[stepShortPath].filter(function (entry) {
						return entry.serviceName === query.service;
					});
				}
			}
			result.byProcessor[stepShortPath] = [];
			result.stepTotal[stepShortPath]   = getEmptyData();
			if (!entries.length) return;

			// 4. Filter by date range
			if (query.dateFrom) {
				entries = entries.filter(function (data) {
					return data.date >= query.dateFrom;
				});
			}
			if (query.dateTo) {
				entries = entries.filter(function (data) {
					return data.date <= query.dateTo;
				});
			}

			// 5. Custom filter
			if (customFilter) {
				entries = deferred.map(entries, function (entry) {
					return customFilter(entry, query)(function (isOK) { return isOK ? entry : null; });
				}).invoke('filter', Boolean);
			}
			return deferred(entries)(function (filteredEntries) {
				entries = filteredEntries;

				// 6. Get extra data for each entry
				return deferred.map(entries, function (data) {
					return getProcessorAndProcessingTime(data)(function (result) {
						assign(data, result);
					});
				});
			})(function () {
				var dataByProcessors = {};
				return deferred.map(entries, function (entry) {
					// May happen only in case of data inconsistency
					if (!entry.processor) return;
					// Older businessProcess don't have processingTime, so they're useless here
					if (!entry.processingTime) return;

					// 7. Calculate processing time totals
					if (!dataByProcessors[entry.processor]) {
						dataByProcessors[entry.processor] = getEmptyData();
						dataByProcessors[entry.processor].processor = entry.processor;
					}
					dataByProcessors[entry.processor].processed++;
					dataByProcessors[entry.processor].minTime =
						Math.min(dataByProcessors[entry.processor].minTime, entry.processingTime);
					dataByProcessors[entry.processor].maxTime =
						Math.max(dataByProcessors[entry.processor].maxTime, entry.processingTime);
					dataByProcessors[entry.processor].totalTime += entry.processingTime;
					dataByProcessors[entry.processor].avgTime =
						dataByProcessors[entry.processor].totalTime /
						dataByProcessors[entry.processor].processed;

					result.byProcessor[stepShortPath] =
						Object.keys(dataByProcessors).map(function (processorId) {
							return dataByProcessors[processorId];
						});

					// 7.1 Per step totals
					result.stepTotal[stepShortPath].processed++;
					result.stepTotal[stepShortPath].minTime =
						Math.min(result.stepTotal[stepShortPath].minTime, entry.processingTime);
					result.stepTotal[stepShortPath].maxTime =
						Math.max(result.stepTotal[stepShortPath].maxTime, entry.processingTime);
					result.stepTotal[stepShortPath].totalTime += entry.processingTime;
					result.stepTotal[stepShortPath].avgTime =
						result.stepTotal[stepShortPath].totalTime /
						result.stepTotal[stepShortPath].processed;

					// 7.2 Per service total
					if (!result.byService[entry.serviceName]) {
						result.byService[entry.serviceName] = getEmptyData();
					}

					var byService = result.byService[entry.serviceName];
					byService.processed++;
					byService.totalTime += entry.processingTime;
					byService.avgTime = byService.totalTime / byService.processed;

					// 7.3 Per step and service total
					if (!result.byStepAndService[stepShortPath]) {
						result.byStepAndService[stepShortPath] = {};
					}
					if (!result.byStepAndService[stepShortPath][entry.serviceName]) {
						result.byStepAndService[stepShortPath][entry.serviceName] = getEmptyData();
					}
					var byStepAndService = result.byStepAndService[stepShortPath][entry.serviceName];
					byStepAndService.processed++;
					byStepAndService.totalTime += entry.processingTime;
					byStepAndService.avgTime = byStepAndService.totalTime / byStepAndService.processed;

					// 7.4 Compute totals for approved bps
					return businessProcessesApprovedMap(function (approvedMap) {
						return approvedMap.get(entry.id)(function (isApproved) {
							if (!isApproved || (isApproved[0] !== '1') ||
									(unserializeValue(isApproved) === false)) {
								return;
							}

							if (!result.byBusinessProcess.data[entry.id]) {
								result.byBusinessProcess.data[entry.id] = getEmptyData();
								result.byBusinessProcess.totalProcessing.processed++;
								result.byBusinessProcess.total.processed++;
							}
							result.byBusinessProcess.data[entry.id].totalTime += entry.processingTime;
							if (entry.correctionTime) {
								result.byBusinessProcess.data[entry.id].correctionTime = entry.correctionTime;
								result.byBusinessProcess.data[entry.id].totalTime += entry.correctionTime;
								if (!result.byBusinessProcess.data[entry.id].hasCorrectionTime) {
									result.byBusinessProcess.data[entry.id].hasCorrectionTime = true;
									result.byBusinessProcess.totalCorrection.processed++;
								}
							} else {
								result.byBusinessProcess.data[entry.id].correctionTime = 0;
							}
							result.byBusinessProcess.totalProcessing.totalTime += entry.processingTime;
							result.byBusinessProcess.totalCorrection.totalTime += (entry.correctionTime || 0);
							result.byBusinessProcess.total.totalTime =
								result.byBusinessProcess.totalProcessing.totalTime
								+ result.byBusinessProcess.totalCorrection.totalTime;

							result.byBusinessProcess.totalProcessing.avgTime =
								result.byBusinessProcess.totalProcessing.totalTime /
								result.byBusinessProcess.totalProcessing.processed;

							// Can be 0 here
							if (result.byBusinessProcess.totalCorrection.processed) {
								result.byBusinessProcess.totalCorrection.avgTime =
									result.byBusinessProcess.totalCorrection.totalTime /
									result.byBusinessProcess.totalCorrection.processed;
							}

							result.byBusinessProcess.total.avgTime =
								result.byBusinessProcess.total.totalTime /
								result.byBusinessProcess.total.processed;
						});
					});
				});
			});
		})(function () {
			var perUserResult;
			if (query.step && options.userId) {
				perUserResult = {
					processor: getEmptyData(),
					stepTotal: getEmptyData()
				};
				if (!result.byProcessor[query.step] || !result.byProcessor[query.step].length) {
					return perUserResult;
				}
				result.byProcessor[query.step].some(function (resultItem) {
					if (resultItem.processor === options.userId) {
						perUserResult.processor = resultItem;
						return true;
					}
				});
				perUserResult.stepTotal = result.stepTotal[query.step];
				return perUserResult;
			}
			if (result.byBusinessProcess.totalProcessing.processed) {
				// We can calculate min and max only after we have collected all the data
				Object.keys(result.byBusinessProcess.data).forEach(function (businessProcessId) {
					var data = result.byBusinessProcess.data[businessProcessId];
					// Correction
					result.byBusinessProcess.totalCorrection.minTime = Math.min(
						result.byBusinessProcess.totalCorrection.minTime,
						data.correctionTime
					);
					result.byBusinessProcess.totalCorrection.maxTime = Math.max(
						result.byBusinessProcess.totalCorrection.maxTime,
						data.correctionTime
					);
					// Processing
					result.byBusinessProcess.totalProcessing.minTime = Math.min(
						result.byBusinessProcess.totalProcessing.minTime,
						data.totalTime
					);
					result.byBusinessProcess.totalProcessing.maxTime = Math.max(
						result.byBusinessProcess.totalProcessing.maxTime,
						data.totalTime
					);
					// Total
					result.byBusinessProcess.total.minTime = Math.min(
						result.byBusinessProcess.total.minTime,
						data.totalTime + data.correctionTime
					);
					result.byBusinessProcess.total.maxTime = Math.max(
						result.byBusinessProcess.total.maxTime,
						data.totalTime + data.correctionTime
					);
				});
			}

			return result;
		});
	}
	);
};
