'use strict';

var includes                         = require('es5-ext/array/#/contains')
  , assign                           = require('es5-ext/object/assign')
  , ensureObject                     = require('es5-ext/object/valid-object')
  , ensureCallable                   = require('es5-ext/object/valid-callable')
  , deferred                         = require('deferred')
  , memoize                          = require('memoizee')
  , ensureDatabase                   = require('dbjs/valid-dbjs')
  , unserializeValue                 = require('dbjs/_setup/unserialize/value')
  , ensureDriver                     = require('dbjs-persistence/ensure-driver')
  , businessProcessesApprovedMap     = require('../../utils/business-processes-approved-map')
  , getClosedProcessingStepsStatuses = require('./get');

var getEmptyData = function () {
	return {
		// Count of finalized files/steps
		processed: 0,
		// Average processing time
		avgTime: 0,
		// Shortest processing time
		minTime: Infinity,
		// Longest processing time
		maxTime: 0,
		// Sum of all processing times
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
	var driver = ensureDriver(ensureObject(data).driver)
	  , processingStepsMeta = ensureObject(data.processingStepsMeta)
	  , db = ensureDatabase(data.db)
	  , query = data.query || {}
	  , customFilter = data.customFilter ? ensureCallable(data.customFilter) : null
	  , userId = data.userId;

	var result = {
		byBusinessProcess: {
			// All files processing time
			totalProcessing: getEmptyData(),
			// All files correction time
			totalCorrection: getEmptyData(),
			// All files processing + correction time
			total: getEmptyData()
		},
		// Data per step and processor:
		// byProcessor // Map of steps
		// byProcessor[stepShortPath] // Array of processors data
		// byProcessor[stepShortPath][0] // Data of processor for given step
		byProcessor: {},
		// Data per step:
		// stepTotal // Map of steps
		// stepTotal[stepShortPath] // Data of step
		stepTotal: {},
		// Data per step and service
		// byStepAndService // Map of steps
		// byStepAndService[shortStepPath] // Map of services
		// byStepAndService[shortStepPath][serviceName] // Data of service for given step
		byStepAndService: {},
		// Data per service:
		// byService // Map of services
		// byService[serviceName] // Data of service
		byService: {}
	};

	// Temporary data container
	var businessProcessesData = {};

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
					// 7.1 Per step and processor
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

					// 7.2 Per step
					result.stepTotal[stepShortPath].processed++;
					result.stepTotal[stepShortPath].minTime =
						Math.min(result.stepTotal[stepShortPath].minTime, entry.processingTime);
					result.stepTotal[stepShortPath].maxTime =
						Math.max(result.stepTotal[stepShortPath].maxTime, entry.processingTime);
					result.stepTotal[stepShortPath].totalTime += entry.processingTime;
					result.stepTotal[stepShortPath].avgTime =
						result.stepTotal[stepShortPath].totalTime /
						result.stepTotal[stepShortPath].processed;

					// 7.3 Per service
					if (!result.byService[entry.serviceName]) {
						result.byService[entry.serviceName] = getEmptyData();
					}

					var byService = result.byService[entry.serviceName];
					byService.processed++;
					byService.totalTime += entry.processingTime;
					byService.avgTime = byService.totalTime / byService.processed;

					// 7.4 Per step and service
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

					// 7.5 Compute totals for approved files
					return businessProcessesApprovedMap(function (approvedMap) {
						return approvedMap.get(entry.id)(function (isApproved) {
							if (!isApproved || (isApproved[0] !== '1') ||
									(unserializeValue(isApproved) === false)) {
								return;
							}

							if (!businessProcessesData[entry.id]) {
								businessProcessesData[entry.id] = getEmptyData();
								result.byBusinessProcess.totalProcessing.processed++;
								result.byBusinessProcess.total.processed++;
							}
							businessProcessesData[entry.id].totalTime += entry.processingTime;
							if (entry.correctionTime) {
								businessProcessesData[entry.id].correctionTime = entry.correctionTime;
								businessProcessesData[entry.id].totalTime += entry.correctionTime;
								if (!businessProcessesData[entry.id].hasCorrectionTime) {
									businessProcessesData[entry.id].hasCorrectionTime = true;
									result.byBusinessProcess.totalCorrection.processed++;
								}
							} else {
								businessProcessesData[entry.id].correctionTime = 0;
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
			if (query.step && userId) {
				// 8. Filter by user (data for one processor)
				perUserResult = {
					processor: getEmptyData(),
					stepTotal: getEmptyData()
				};
				if (!result.byProcessor[query.step] || !result.byProcessor[query.step].length) {
					return perUserResult;
				}
				result.byProcessor[query.step].some(function (resultItem) {
					if (resultItem.processor === userId) {
						perUserResult.processor = resultItem;
						return true;
					}
				});
				perUserResult.stepTotal = result.stepTotal[query.step];
				return perUserResult;
			}
			if (result.byBusinessProcess.totalProcessing.processed) {
				// We can calculate min and max only after we have collected all the data
				Object.keys(businessProcessesData).forEach(function (businessProcessId) {
					var data = businessProcessesData[businessProcessId];
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
	});
};
