'use strict';

var forEach      = require('es5-ext/object/for-each')
  , ensureObject = require('es5-ext/object/valid-object')
  , getEmptyData = require('../get-reduction-template');

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
module.exports = function (data, processingStepsMeta) {
	(ensureObject(data) && ensureObject(processingStepsMeta));

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

	forEach(data, function (stepData, stepShortPath) {

		// Initialize containers
		result.byStep[stepShortPath] = getEmptyData();
		result.byStepAndProcessor[stepShortPath] = Object.create(null);
		result.byStepAndService[stepShortPath] = Object.create(null);
		processingStepsMeta[stepShortPath]._services.forEach(function (serviceName) {
			if (!result.byService[serviceName]) result.byService[serviceName] = getEmptyData();
			result.byStepAndService[stepShortPath][serviceName] = getEmptyData();
		});

		// Reduce data
		forEach(stepData, function (bpData) {
			// May happen only in case of data inconsistency
			if (!bpData.processor) return;

			// Older businessProcess don't have processingTime, so they're useless here
			if (!bpData.processingTime) return;

			// Do not include not yet finally processed steps
			if (!bpData.processingDate) return;

			// Initialize container
			if (!result.byStepAndProcessor[stepShortPath][bpData.processor]) {
				result.byStepAndProcessor[stepShortPath][bpData.processor] = getEmptyData();
				result.byStepAndProcessor[stepShortPath][bpData.processor].processor = bpData.processor;
			}

			// Reduce processingTime
			reduce(result.all.processing, bpData.processingTime);
			reduce(result.byService[bpData.serviceName].processing, bpData.processingTime);
			reduce(result.byStep[stepShortPath].processing, bpData.processingTime);
			reduce(result.byStepAndService[stepShortPath][bpData.serviceName].processing,
				bpData.processingTime);
			reduce(result.byStepAndProcessor[stepShortPath][bpData.processor].processing,
				bpData.processingTime);

			// Reduce eventual correctionTime
			if (bpData.correctionTime) {
				reduce(result.all.correction, bpData.correctionTime);
				reduce(result.byService[bpData.serviceName].correction, bpData.correctionTime);
				reduce(result.byStep[stepShortPath].correction, bpData.correctionTime);
				reduce(result.byStepAndService[stepShortPath][bpData.serviceName].correction,
					bpData.correctionTime);
				reduce(result.byStepAndProcessor[stepShortPath][bpData.processor].correction,
					bpData.correctionTime);
			}
		});
	});
	return result;
};
