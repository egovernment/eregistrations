'use strict';

var filter       = require('es5-ext/object/filter')
  , ensureObject = require('es5-ext/object/valid-object');

/**
	* @param data  - `businessProcesses` result from ../get-data
	* @returns {Object} - Filter data of same format as input data
*/
module.exports = exports = function (data, query) {
	(ensureObject(data) && ensureObject(query));

	return filter(data, function (bpData, bpId) {

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

		// Custom filter
		if (exports.customFilter) {
			if (!exports.customFilter.call(query, bpData, bpId)) return false;
		}

		return true;
	});
};
