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
		// byDateAndService[date] // Map of dates
		// byDateAndService[date][serviceName] // Count for given service at given date
		byDateAndService: {}
	};

	serviceNames.forEach(function (name) { result.byService[name] = getEmptyData(); });

	forEach(data, function (bpData, businessProcessId) {
		if (!bpData.approvedDate) return;

		var dateString = bpData.approvedDate.toISOString().slice(0, 10)
		  , time = bpData.approvedDateTime - bpData.submissionDateTime;

		if (!result.byDateAndService[dateString]) {
			serviceNames.forEach(function (name) {
				this[name] = 0;
			}, result.byDateAndService[dateString] = {});
		}
		reduce(result.all, time);
		reduce(result.byService[bpData.serviceName], time);
		result.byDateAndService[dateString][bpData.serviceName]++;
	});
	return result;
};
