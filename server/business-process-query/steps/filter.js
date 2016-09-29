'use strict';

var aFrom            = require('es5-ext/array/from')
  , includes         = require('es5-ext/array/#/contains')
  , filter           = require('es5-ext/object/filter')
  , map              = require('es5-ext/object/map')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , ensureObject     = require('es5-ext/object/valid-object')
  , filterBps        = require('../business-processes/filter');

var resolveBpFilterQuery = function (query) {
	query = normalizeOptions(query, {
		dateFrom: null,
		dateTo: null,
		step: null,
		pendingAt: null,
		flowStatus: 'submitted'
	});
	if (exports.customStepSpecificQueries) {
		aFrom(exports.customStepSpecificQueries).forEach(function (name) { delete query[name]; });
	}
	return query;
};

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

	var businessProcessesData = filterBps(data.businessProcesses, resolveBpFilterQuery(query));

	// 2. Filter items
	return {
		businessProcesses: businessProcessesData,
		steps: map(stepsData, function (stepData, stepShortPath) {
			return filter(stepData, function (bpStepData, bpId) {

				// Filter any filtered at business process level
				if (!businessProcessesData[bpId]) return false;

				// Filter out any inconsistent
				if (!bpStepData.pendingDate) return false;

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
					if (!exports.customFilter.call(query, bpStepData, bpId, stepShortPath)) {
						return false;
					}
				}
				return true;
			});
		})
	};
};
