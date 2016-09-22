'use strict';

var forEach      = require('es5-ext/object/for-each')
  , ensureObject = require('es5-ext/object/valid-object')
  , serviceNames = require('../../utils/business-process-service-names')
  , getEmptyData = require('../utils/get-time-reduction-template')
  , reduce       = require('../utils/reduce-time');

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
module.exports = function (data) {
	ensureObject(data);

	var result = {
		// Reduction data for all
		all: getEmptyData(),
		// Data per service:
		// byService // Map of services
		// byService[serviceName] // Time reduction data of service
		byService: {},
		// byDateAndService // Map of services
		// byDateAndService[serviceName] // Map of dates
		// byDateAndService[serviceName][date] // Count for given date
		byDateAndService: {}
	};

	serviceNames.forEach(function (name) {
		result.byService[name] = getEmptyData();
		result.byDateAndService[name] = Object.create(null);
	});

	forEach(data, function (bpData, businessProcessId) {
		if (!bpData.approvedDate) return;

		var dateString = bpData.approvedDate.toISOString().slice(0, 10)
		  , time = bpData.approvedDateTime - bpData.submissionDateTime;

		if (!result.byDateAndService[bpData.serviceName][dateString]) {
			result.byDateAndService[bpData.serviceName][dateString] = 0;
		}
		reduce(result.all, time);
		reduce(result.byService[bpData.serviceName], time);
		result.byDateAndService[bpData.serviceName][dateString]++;
	});
	return result;
};
