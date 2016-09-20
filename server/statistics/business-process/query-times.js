'use strict';

var ensureObject = require('es5-ext/object/valid-object')
  , ensureDriver = require('dbjs-persistence/ensure-driver')
  , getData      = require('./get-data')
  , filterData   = require('./step-processing-times/filter')
  , reduceData   = require('./step-processing-times/reduce');

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
module.exports = function (config) {
	var driver = ensureDriver(ensureObject(config).driver)
	  , processingStepsMeta = ensureObject(config.processingStepsMeta);

	// 1. Get data
	return getData(driver, processingStepsMeta)(function (data) {
		// 2. Filter data
		return filterData(data, config.query || {}, processingStepsMeta, config);
	})(function (data) {
		// 3. Reduce data
		return reduceData(data, processingStepsMeta);
	});
};
