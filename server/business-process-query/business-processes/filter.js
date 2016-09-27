'use strict';

var filter       = require('es5-ext/object/filter')
  , ensureObject = require('es5-ext/object/valid-object');

/**
	*
	* @param config
	* driver                  - Database driver
	* processingStepsMeta     - map of processing steps
	* db                      - dbjs database
	* query (optional)        - query past from controller
	* customFilter (optional) - function used to filter by system specific parameters
	* @returns {Object}
*/
module.exports = exports = function (data, query) {
	(ensureObject(data) && ensureObject(query));

	return filter(data, function (bpData, bpId) {

		// 1. Filter by service
		if (query.service) {
			if (bpData.serviceName !== query.service) return false;
		}

		// 2.2 Filter by date range
		if (query.dateFrom) {
			if (!(bpData.approvedDate >= query.dateFrom)) return false;
		}
		if (query.dateTo) {
			if (!(bpData.approvedDate <= query.dateTo)) return false;
		}

		if (exports.customFilter) {
			if (!exports.customFilter.call(query, bpData, bpId)) return false;
		}
		return true;
	});
};
