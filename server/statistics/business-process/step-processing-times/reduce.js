'use strict';

var ensureObject = require('es5-ext/object/valid-object')
  , deferred     = require('deferred')
  , ensureDriver = require('dbjs-persistence/ensure-driver')
  , getEmptyData = require('../get-reduction-template')
  , getData      = require('../get-data')
  , filterData   = require('./filter');

var reduce = function (data, time) {
	data.count++;
	data.minTime = Math.min(data.minTime, time);
	data.maxTime = Math.max(data.maxTime, time);
	data.totalTime += time;
	data.avgTime = data.totalTime / data.count;
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
module.exports = function (config) {
	var driver = ensureDriver(ensureObject(config).driver)
	  , processingStepsMeta = ensureObject(config.processingStepsMeta);

	// 1. Get data for all processing steps from all services
	return getData(driver, processingStepsMeta)(function (data) {
		return filterData(data, config.query || {}, processingStepsMeta, config)(function (entriesMap) {
			var result = {
				// Reduction data for all
				all: getEmptyData(),
				// Data per service:
				// byService // Map of services
				// byService[serviceName] // Data of service
				byService: {},
				// Data per step:
				// byStep // Map of steps
				// byStep[stepShortPath] // Data of step
				byStep: {},
				// Data per step and service
				// byStepAndService // Map of steps
				// byStepAndService[shortStepPath] // Map of services
				// byStepAndService[shortStepPath][serviceName] // Data of service for given step
				byStepAndService: {},
				// Data per step and processor:
				// byStepAndProcessor // Map of steps
				// byStepAndProcessor[stepShortPath] // Map of processors data
				// byStepAndProcessor[stepShortPath][officialId] // Data of processor for given step
				byStepAndProcessor: {}
			};

			return deferred.map(Object.keys(entriesMap), function (stepShortPath) {

				// Initialize containers
				result.byStep[stepShortPath] = getEmptyData();
				result.byStepAndProcessor[stepShortPath] = Object.create(null);
				result.byStepAndService[stepShortPath] = Object.create(null);
				config.processingStepsMeta[stepShortPath]._services.forEach(function (serviceName) {
					if (!result.byService[serviceName]) result.byService[serviceName] = getEmptyData();
					result.byStepAndService[stepShortPath][serviceName] = getEmptyData();
				});

				// Reduce data
				return deferred.map(Object.keys(entriesMap[stepShortPath]), function (businessProcessId) {
					var entry = entriesMap[stepShortPath][businessProcessId];

					// May happen only in case of data inconsistency
					if (!entry.processor) return;

					// Older businessProcess don't have processingTime, so they're useless here
					if (!entry.processingTime) return;

					// Do not include not yet finally processed steps
					if (!entry.processingDate) return;

					// Initialize container
					if (!result.byStepAndProcessor[stepShortPath][entry.processor]) {
						result.byStepAndProcessor[stepShortPath][entry.processor] = getEmptyData();
						result.byStepAndProcessor[stepShortPath][entry.processor].processor = entry.processor;
					}

					// Reduce processingTime
					reduce(result.all.processing, entry.processingTime);
					reduce(result.byService[entry.serviceName].processing, entry.processingTime);
					reduce(result.byStep[stepShortPath].processing, entry.processingTime);
					reduce(result.byStepAndService[stepShortPath][entry.serviceName].processing,
						entry.processingTime);
					reduce(result.byStepAndProcessor[stepShortPath][entry.processor].processing,
						entry.processingTime);

					// Reduce correctionTime
					if (entry.correctionTime) {
						reduce(result.all.correction, entry.correctionTime);
						reduce(result.byService[entry.serviceName].correction, entry.correctionTime);
						reduce(result.byStep[stepShortPath].correction, entry.correctionTime);
						reduce(result.byStepAndService[stepShortPath][entry.serviceName].correction,
							entry.correctionTime);
						reduce(result.byStepAndProcessor[stepShortPath][entry.processor].correction,
							entry.correctionTime);
					}
				});
			})(result);
		});
	});
};
