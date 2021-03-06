'use strict';

var ensureObject = require('es5-ext/object/valid-object')
  , getEmptyData = require('../utils/get-time-reduction-template')
  , reduce       = require('../utils/reduce-time')
  , timeCalculationsStart = require('../utils/time-calculations-start')
  , processingStepsMeta   = require('../../../processing-steps-meta');

/**
	* @param data  - Direct result from ../get-data or ./filter
	* opts {Object}
	* opts.mode    - ['full', 'workingHours']
	* @returns {Object} - Reduced map (format documented in code)
*/
module.exports = function (data/*, opts */) {
	var options               = Object(arguments[1])
	  , mode                  = options.mode || 'workingHours'
	  , defaultReduceTimeOpts = { avgTimeMod: 0.9 }
	  , reduceTimeOpts        = options.reduceTimeOpts || defaultReduceTimeOpts;

	ensureObject(data);

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

	data.steps.forEach(function (stepData, stepShortPath) {

		// Initialize containers
		result.byStep[stepShortPath] = getEmptyData();
		result.byStepAndProcessor[stepShortPath] = Object.create(null);
		result.byStepAndService[stepShortPath] = Object.create(null);
		processingStepsMeta[stepShortPath]._services.forEach(function (serviceName) {
			if (!result.byService[serviceName]) result.byService[serviceName] = getEmptyData();
			result.byStepAndService[stepShortPath][serviceName] = getEmptyData();
		});

		if (options.includeBusinessProcesses) {
			result.byStep[stepShortPath].businessProcesses = [];
		}

		// Reduce data
		stepData.forEach(function (bpStepData, bpId) {
			var serviceName        = data.businessProcesses.get(bpId).serviceName
			  , submissionDateTime = data.businessProcesses.get(bpId).submissionDateTime
			  , processor          = bpStepData.processor
			  , processingTime, correctionTime, skipTimeCount;

			result.all.startedCount++;
			result.byService[serviceName].startedCount++;
			result.byStep[stepShortPath].startedCount++;
			result.byStepAndService[stepShortPath][serviceName].startedCount++;

			// Do not take into time reduction not yet finalized steps
			if (!bpStepData.processingDate) return;

			// May happen only in case of data inconsistency
			if (!processor) return;

			if (mode === 'workingHours') {
				processingTime = bpStepData.processingWorkingHoursTime || 0;
			} else {
				processingTime =
					(bpStepData.processingDateTime - bpStepData.pendingDateTime -
						(bpStepData.processingHolidaysTime || 0) - (bpStepData.nonProcessingTime || 0));
			}

			correctionTime = bpStepData.correctionTime;
			skipTimeCount = (submissionDateTime < timeCalculationsStart) || (processingTime < (1000 * 3));

			// If there's something wrong with calculations (may happen with old data), or
			// the submission date before final calcualtion version we do not count time
			if (skipTimeCount) {
				processingTime = 0;
				if (correctionTime) {
					correctionTime = 0;
				}
			}

			// Initialize container
			if (!result.byStepAndProcessor[stepShortPath][processor]) {
				result.byStepAndProcessor[stepShortPath][processor] = getEmptyData();
				if (options.includeBusinessProcesses) {
					result.byStepAndProcessor[stepShortPath][processor].businessProcesses = [];
				}
			}
			result.byStepAndProcessor[stepShortPath][processor].startedCount++;

			// Reduce processingTime
			reduce(result.all.processing, processingTime, reduceTimeOpts);
			reduce(result.byService[serviceName].processing, processingTime, reduceTimeOpts);
			reduce(result.byStep[stepShortPath].processing, processingTime, reduceTimeOpts);
			reduce(result.byStepAndService[stepShortPath][serviceName].processing,
				processingTime, reduceTimeOpts);
			reduce(result.byStepAndProcessor[stepShortPath][processor].processing,
				processingTime, reduceTimeOpts);

			// Reduce eventual correctionTime
			if (correctionTime != null) {
				reduce(result.all.correction, correctionTime, reduceTimeOpts);
				reduce(result.byService[serviceName].correction, correctionTime, reduceTimeOpts);
				reduce(result.byStep[stepShortPath].correction, correctionTime, reduceTimeOpts);
				reduce(result.byStepAndService[stepShortPath][serviceName].correction,
					correctionTime, reduceTimeOpts);
				reduce(result.byStepAndProcessor[stepShortPath][processor].correction,
					correctionTime, reduceTimeOpts);
			}

			if (options.includeBusinessProcesses && !skipTimeCount) {
				var businessProcessStepRecord = {
					bpId: bpId,
					// file name
					businessName: data.businessProcesses.get(bpId).businessName,
					processor: processor,
					processingTime: processingTime,
					processingStart: bpStepData.pendingDateTime,
					processingEnd: bpStepData.processingDateTime
				};

				result.byStep[stepShortPath].businessProcesses.push(businessProcessStepRecord);
				result.byStepAndProcessor[stepShortPath][processor].businessProcesses.push(
					businessProcessStepRecord
				);
			}
		});
	});
	return result;
};
