'use strict';

var forEach      = require('es5-ext/object/for-each')
  , ensureObject = require('es5-ext/object/valid-object')
  , serviceNames = require('../../../utils/business-process-service-names')
  , getEmptyData = require('../utils/get-time-reduction-template')
  , reduce       = require('../utils/reduce-time');

/**
	* @param data  - `businessProcesses` result from ../get-data or direct result from ./filter
	* @returns {Object} - Reduced map (format documented in code)
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
		result.all.startedCount++;
		result.byService[bpData.serviceName].startedCount++;

		if (!bpData.approvedDate) return;

		var dateString = bpData.approvedDate.toISOString().slice(0, 10)
		  , processingTime = bpData.approvedDateTime - bpData.submissionDateTime;

		// If there's something wrong with calculations (may happen with old data), ignore record
		if (processingTime < (1000 * 60)) return;

		if (!result.byDateAndService[dateString]) {
			serviceNames.forEach(function (name) {
				this[name] = 0;
			}, result.byDateAndService[dateString] = {});
		}
		reduce(result.all.processing, processingTime);
		reduce(result.byService[bpData.serviceName].processing, processingTime);
		result.byDateAndService[dateString][bpData.serviceName]++;
	});
	return result;
};
