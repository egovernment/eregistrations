'use strict';

var includes     = require('es5-ext/string/#/contains')
  , ensureObject = require('es5-ext/object/valid-object')
  , Map          = require('es6-map')
  , ensureMap    = require('es6-map/valid-map');
/**
	* @param data  - `businessProcesses` result from ../get-data
	* @returns {Object} - Filter data of same format as input data
*/
module.exports = exports = function (data, query) {
	var searchTokens, filteredData = new Map();

	(ensureMap(data) && ensureObject(query));

	if (query.search) searchTokens = query.search.split(' ');
	data.forEach(function (bpData, bpId) {
		var filterResult;

		// Unconditionally filter deleted records
		if (!bpData._existing) return;

		// Unconditionally filter demo files
		if (bpData.isDemo) return;

		// Internal flow status filter
		// Simpler version of 'status' filter, this one we use interally to easily filter out
		// only submitted or approved files
		if (query.flowStatus) {
			if (query.flowStatus === 'submitted') {
				if (!bpData.submissionDateTime) return;
			} else if (query.flowStatus === 'approved') {
				if (!bpData.approvedDate) return;
			}
		}

		// Filter by service
		if (query.service) {
			if (bpData.serviceName !== query.service) return;
		}

		// Filter by registration
		if (query.registration) {
			if (!bpData.registrations.has(query.registration)) return;
		}

		// Filter by status
		if (query.status) {
			if (bpData.status !== query.status) return;
		}

		// Filter by submitter type
		if (query.submitterType) {
			if (bpData.submitterType !== query.submitterType) return;
		}

		// Filter by approved in given date range
		if (query.dateFrom) {
			if (!bpData.approvedDate) return;
			if (bpData.approvedDate < query.dateFrom) return;
		}
		if (query.dateTo) {
			if (!bpData.approvedDate) return;
			if (bpData.approvedDate > query.dateTo) return;
		}

		// Filter by search string
		if (searchTokens) {
			filterResult = searchTokens.every(function (token) {
				return includes.call(bpData.searchString, token);
			});

			if (!filterResult) return;
		}

		// Custom filter
		if (exports.customFilter) {
			if (!exports.customFilter.call(query, bpData, bpId)) return;
		}

		filteredData.set(bpId, bpData);
	});
	return filteredData;
};
