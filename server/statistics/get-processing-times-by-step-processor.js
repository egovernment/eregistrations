'use strict';

var includes                         = require('es5-ext/array/#/contains')
  , normalizeOptions                 = require('es5-ext/object/normalize-options')
  , getClosedProcessingStepsStatuses = require('./get-closed-processing-steps-statuses')
  , ensureDriver                     = require('dbjs-persistence/ensure-driver')
  , ensureDatabase                   = require('dbjs/valid-dbjs')
  , ensureObject                     = require('es5-ext/object/valid-object')
  , ensureCallable                   = require('es5-ext/object/valid-callable')
  , deferred                         = require('deferred')
  , unserializeValue                 = require('dbjs/_setup/unserialize/value');

var getProcessorAndProcessingTime = function (data) {
	return deferred(
		data.storage.get(data.id + '/' + data.stepFullPath + '/processor')(
			function (processorData) {
				if (!processorData || processorData.value[0] !== '7') return;
				data.processor = processorData.value.slice(1);
			}
		).done(),
		data.storage.get(data.id + '/' + data.stepFullPath + '/processingTime')(
			function (processingTimeData) {
				if (!processingTimeData || processingTimeData.value[2] !== '2') return;
				data.processingTime =
					Number(unserializeValue(processingTimeData.value));
			}
		).done()
	);
};
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
	var result = {}, driver, processingStepsMeta, db, query, customFilter, options;
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
	return getClosedProcessingStepsStatuses(driver, processingStepsMeta, db)(
		function (businessProcessesByStepsMap) {
			if (!businessProcessesByStepsMap) return;
			return deferred.map(Object.keys(businessProcessesByStepsMap),
				function (stepShortPath) {
					var entries = businessProcessesByStepsMap[stepShortPath];
					if (query.service) {
						if (!includes.call(processingStepsMeta[stepShortPath]._services, query.service)) {
							return result;
						}
						if (processingStepsMeta[stepShortPath]._services.length > 1) {
							entries = businessProcessesByStepsMap[stepShortPath].filter(function (entry) {
								return entry.serviceName === query.service;
							});
						}
					}
					result[stepShortPath] = [];
					if (!entries.length) return result;

					if (query.from) {
						entries = entries.filter(function (data) {
							return data.date >= query.from;
						});
					}
					if (query.to) {
						entries = entries.filter(function (data) {
							return data.date <= query.to;
						});
					}
					if (customFilter) {
						entries = entries.filter(customFilter);
					}
					return deferred.map(entries, function (data) {
						return getProcessorAndProcessingTime(data);
					})(function () {
						var dataByProcessors = {};
						entries.forEach(function (entry) {
							// Should not happen, but it's not right place to crash due to data inconsistency
							if (!entry.processor) return;
							// Older businessProcess don't have processingTime, so they're useless here
							if (!entry.processingTime) return;
							if (!dataByProcessors[entry.processor]) {
								dataByProcessors[entry.processor] = {
									processor: entry.processor,
									processed: 0,
									avgTime: 0,
									minTime: Infinity,
									maxTime: 0,
									totalTime: 0
								};
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
						});
						result[stepShortPath] = Object.keys(dataByProcessors).map(function (processorId) {
							return dataByProcessors[processorId];
						});

						return result;
					});
				})(result);
		}
	);
};
