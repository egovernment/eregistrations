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

	// 1. Filter by service
	if (query.service) {
		data = filter(data, function (entry) { return entry.serviceName === query.service; });
	}

	// 2.2 Filter by date range
	if (query.dateFrom) {
		data = filter(data, function (entry) {
			return entry.approvedDate >= query.dateFrom;
		});
	}
	if (query.dateTo) {
		data = filter(data, function (entry) {
			return entry.approvedDate <= query.dateTo;
		});
	}

	if (exports.customFilter) data = filter(data, exports.customFilter, query);
	return data;
};
