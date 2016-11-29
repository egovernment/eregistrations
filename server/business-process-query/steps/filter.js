'use strict';

var aFrom            = require('es5-ext/array/from')
  , includes         = require('es5-ext/array/#/contains')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , ensureObject     = require('es5-ext/object/valid-object')
  , Map              = require('es6-map')
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
	var stepsData = data.steps, filteredStepsData;

	// 1. Exclude not applicable steps
	if (query.step || query.service) {
		filteredStepsData = new Map();
		stepsData.forEach(function (stepData, stepShortPath) {
			// Exclude by step
			if (query.step && query.step !== stepShortPath) return;

			// Exclude by service
			if (query.service) {
				if (!includes.call(processingStepsMeta[stepShortPath]._services, query.service)) return;
			}
			filteredStepsData.set(stepShortPath, stepData);
		});
		stepsData = filteredStepsData;
	}

	var filteredBpsData = filterBps(data.businessProcesses, resolveBpFilterQuery(query));

	filteredStepsData = new Map();
	stepsData.forEach(function (stepData, stepShortPath) {
		var filteredStepData = new Map();
		filteredStepsData.set(stepShortPath, filteredStepData);
		stepData.forEach(function (bpStepData, bpId) {

			// Filter any filtered at business process level
			if (!filteredBpsData.has(bpId)) return;

			// Filter out any inconsistent
			if (!bpStepData.pendingDate) return;

			// Filter by processsed in given date range
			if (query.dateFrom) {
				if (!bpStepData.processingDate) return;
				if (bpStepData.processingDate < query.dateFrom) return;
			}
			if (query.dateTo) {
				if (!bpStepData.processingDate) return;
				if (bpStepData.processingDate > query.dateTo) return;
			}

			// Filter by pending at date
			if (query.pendingAt) {
				if (bpStepData.pendingDate > query.pendingAt) return;
				if (bpStepData.processingDate) {
					if (bpStepData.processingDate < query.pendingAt) return;
				}
			}

			// Custom filter
			if (exports.customFilter) {
				if (!exports.customFilter.call(query, bpStepData, bpId, stepShortPath)) return;
			}

			filteredStepData.set(bpId, bpStepData);
		});
	});

	// 2. Filter items
	return {
		businessProcesses: filteredBpsData,
		steps: filteredStepsData
	};
};
