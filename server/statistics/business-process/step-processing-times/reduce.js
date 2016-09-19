'use strict';

var deferred                     = require('deferred')
  , unserializeValue             = require('dbjs/_setup/unserialize/value')
  , businessProcessesApprovedMap = require('../../../utils/business-processes-approved-map')
  , getEmptyData                 = require('../get-reduction-template')
  , filterData                   = require('./filter');

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
			// All files processing time
			totalProcessing: getEmptyData(),
			// All files correction time
			totalCorrection: getEmptyData(),
			// All files processing + correction time
			total: getEmptyData()
		},
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

	// Temporary data container
	var businessProcessesData = {};

	// 1. Get data for all processing steps from all services
	return filterData(data)(function (entriesMap) {
		return deferred.map(Object.keys(entriesMap), function (stepShortPath) {
			var dataByProcessors = result.byStepAndProcessor[stepShortPath] = Object.create(null);
			return deferred.map(entriesMap[stepShortPath], function (entry) {
				// May happen only in case of data inconsistency
				if (!entry.processor) return;
				// Older businessProcess don't have processingTime, so they're useless here
				if (!entry.processingTime) return;

				if (!result.byStep[stepShortPath]) result.byStep[stepShortPath] = getEmptyData();

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

				// 7.2 Per step
				result.byStep[stepShortPath].processed++;
				result.byStep[stepShortPath].minTime =
					Math.min(result.byStep[stepShortPath].minTime, entry.processingTime);
				result.byStep[stepShortPath].maxTime =
					Math.max(result.byStep[stepShortPath].maxTime, entry.processingTime);
				result.byStep[stepShortPath].totalTime += entry.processingTime;
				result.byStep[stepShortPath].avgTime =
					result.byStep[stepShortPath].totalTime /
					result.byStep[stepShortPath].processed;

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
					return approvedMap.get(entry.businessProcessId)(function (isApproved) {
						if (!isApproved || (isApproved[0] !== '1') ||
								(unserializeValue(isApproved) === false)) {
							return;
						}

						if (!businessProcessesData[entry.businessProcessId]) {
							businessProcessesData[entry.businessProcessId] = getEmptyData();
							result.byBusinessProcess.totalProcessing.processed++;
							result.byBusinessProcess.total.processed++;
						}
						businessProcessesData[entry.businessProcessId].totalTime += entry.processingTime;
						if (entry.correctionTime) {
							businessProcessesData[entry.businessProcessId].correctionTime = entry.correctionTime;
							businessProcessesData[entry.businessProcessId].totalTime += entry.correctionTime;
							if (!businessProcessesData[entry.businessProcessId].hasCorrectionTime) {
								businessProcessesData[entry.businessProcessId].hasCorrectionTime = true;
								result.byBusinessProcess.totalCorrection.processed++;
							}
						} else {
							businessProcessesData[entry.businessProcessId].correctionTime = 0;
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
};
