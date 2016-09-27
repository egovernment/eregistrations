'use strict';

var includes     = require('es5-ext/string/#/includes')
  , filter       = require('es5-ext/object/filter')
  , ensureObject = require('es5-ext/object/valid-object');

/**
	* @param data  - `businessProcesses` result from ../get-data
	* @returns {Object} - Filter data of same format as input data
*/
module.exports = exports = function (data, query) {
	var searchTokens;
	(ensureObject(data) && ensureObject(query));

	if (query.search) searchTokens = query.search.split(' ');
	return filter(data, function (bpData, bpId) {
		var filterResult;

		// Filter by service
		if (query.service) {
			if (bpData.serviceName !== query.service) return false;
		}

		// Filter by registration
		if (query.registration) {
			if (!bpData.registrations.has(query.registration)) return false;
		}

		// Filter by date range
		if (query.dateFrom) {
			if (!(bpData.approvedDate >= query.dateFrom)) return false;
		}
		if (query.dateTo) {
			if (!(bpData.approvedDate <= query.dateTo)) return false;
		}

		// Filter by search string
		if (searchTokens) {
			filterResult = searchTokens.every(function (token) {
				return includes.call(bpData.searchString, token);
			});
			if (!filterResult) return false;
		}

		// Custom filter
		if (exports.customFilter) {
			if (!exports.customFilter.call(query, bpData, bpId)) return false;
		}

		return true;
	});
};
