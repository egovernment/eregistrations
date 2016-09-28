'use strict';

var includes     = require('es5-ext/array/#/contains')
  , filter       = require('es5-ext/object/filter')
  , map          = require('es5-ext/object/map')
  , ensureObject = require('es5-ext/object/valid-object');

/**
	* @param data  - Direct result from ../get-data
	* @returns {Object} - Same format as input data with filtered data.steps collection
*/
module.exports = exports = function (data, query, processingStepsMeta) {
	(ensureObject(data) && ensureObject(query) && ensureObject(processingStepsMeta));
	var stepsData = data.steps;

	// 1. Exclude not applicable steps
	if (query.step || query.service) {
		stepsData = filter(stepsData, function (stepData, stepShortPath) {
			// Exclude by step
			if (query.step && query.step !== stepShortPath) return;

			// Exclude by service
			if (query.service) {
				if (!includes.call(processingStepsMeta[stepShortPath]._services, query.service)) return;
			}
			return true;
		});
	}

	// 2. Filter items
	return {
		businessProcesses: data.businessProcesses,
		steps: map(stepsData, function (stepData, stepShortPath) {
			var serviceName;

			if (query.service && (processingStepsMeta[stepShortPath]._services.length > 1)) {
				serviceName = query.service;
			}

			return filter(stepData, function (bpStepData, bpId) {

				// Filter out any inconsistent
				if (!bpStepData.pendingDate) return false;

				// Filter by service
				if (serviceName) {
					if (data.businessProcesses[bpId].serviceName !== serviceName) return false;
				}

				// Filter by processsed in given date range
				if (query.dateFrom) {
					if (!bpStepData.processingDate) return false;
					if (bpStepData.processingDate < query.dateFrom) return false;
				}
				if (query.dateTo) {
					if (!bpStepData.processingDate) return false;
					if (bpStepData.processingDate > query.dateTo) return false;
				}

				// Filter by pending at date
				if (query.pendingAt) {
					if (bpStepData.pendingDate > query.pendingAt) return false;
					if (bpStepData.processingDate) {
						if (bpStepData.processingDate < query.pendingAt) return false;
					}
				}

				// Custom filter
				if (exports.customFilter) {
					if (!exports.customFilter.call(query, bpStepData, bpId, stepShortPath,
							data.businessProcesses[bpId])) {
						return false;
					}
				}
				return true;
			});
		})
	};
};
