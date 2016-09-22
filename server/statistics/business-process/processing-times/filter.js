'use strict';

var filter         = require('es5-ext/object/filter')
  , ensureObject   = require('es5-ext/object/valid-object')
  , ensureCallable = require('es5-ext/object/valid-callable')
  , deferred       = require('deferred');

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
module.exports = function (data, query/*, options*/) {
	(ensureObject(data) && ensureObject(query));

	var options = Object(arguments[1])
	  , customFilter = options.customFilter && ensureCallable(options.customFilter);

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

	if (!customFilter) return deferred(data);

	// 2.3. Custom filter
	var newData = Object.create(null);
	return deferred.map(Object.keys(data), function (businessProcessId) {
		var entry = data[businessProcessId];
		return customFilter(entry, query)(function (isOk) {
			if (isOk) newData[businessProcessId] = entry;
		}.bind(this));
	})(newData);
};
