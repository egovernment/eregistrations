'use strict';

var oForEach   = require('es5-ext/object/for-each')
  , debugLoad  = require('debug-ext')('load', 6)
  , humanize   = require('debug-ext').humanize
  , Set        = require('es6-set')
  , isSet      = require('es6-set/is-set')
  , memoize    = require('memoizee')
  , env        = require('mano').env
  , getData    = require('../business-process-query/get-data')
  , getDateMap = require('../business-process-query/get-status-history-date-map');

/*
Result map of calculateStatusEventsSums:

[serviceName] = {
	// 1
	businessProcess[status]: sum,
	// 2
	certificate[certificateName][status]: sum,
	processingStep[stepName]: {
		// 3.1
		pending: {
			// 3.1.1
			businessProcess: sum,
			// 3.1.2
			certificate[certificateName]: sum
		},
		// 3.2
		byProcessor[processorId][status]: {
			// 3.2.1
			businessProcess: sum,
			// 3.2.2
			certificate[certificateName]: sum
		}
	}
};
 */

var dbDateToISO = function (date) {
	return date.toISOString().substring(0, 10);
};

var calculate = function (dateMap, data, dateFrom, dateTo) {
	var resultMap = {};

	dateFrom = dbDateToISO(dateFrom);
	dateTo = dbDateToISO(dateTo);

	var storeStatusData = function (resultSet, field, statusData) {
		if (Array.isArray(statusData)) {
			if (!resultSet[field]) resultSet[field] = new Set();

			statusData.forEach(Set.prototype.add.bind(resultSet[field]));
		} else {
			if (resultSet[field] == null) resultSet[field] = 0;

			resultSet[field] += statusData;
		}
	};

	var storePerStatusResult = function (data, resultSet) {
		oForEach(data, function (statusData, status) {
			storeStatusData(resultSet, status, statusData);
		});
	};

	oForEach(dateMap, function (dateData, date) {
		// TODO: This uses string comparison between ISO date string representation. Correct?
		if (date < dateFrom || date > dateTo) return;

		oForEach(dateData, function (serviceData, serviceName) {
			var serviceResult;

			if (!resultMap[serviceName]) {
				resultMap[serviceName] = {
					businessProcess: {},
					certificate: {},
					processingStep: {}
				};
			}

			serviceResult = resultMap[serviceName];

			if (serviceData.businessProcess) {
				// 1 [serviceName].businessProcess[status]
				storePerStatusResult(serviceData.businessProcess, serviceResult.businessProcess);
			}

			if (serviceData.certificate) {
				oForEach(serviceData.certificate, function (certificateData, certificateName) {
					if (!serviceResult.certificate[certificateName]) {
						serviceResult.certificate[certificateName] = {};
					}

					// 2 [serviceName].certificate[certificateName][status]
					storePerStatusResult(certificateData, serviceResult.certificate[certificateName]);
				});
			}

			if (serviceData.processingStep) {
				oForEach(serviceData.processingStep, function (stepData, stepName) {
					var stepResult;

					if (!serviceResult.processingStep[stepName]) {
						serviceResult.processingStep[stepName] = {
							pending: { businessProcess: 0, certificate: {} },
							byProcessor: {}
						};
					}

					stepResult = serviceResult.processingStep[stepName];

					// 3.1.1 [serviceName].processingStep[stepName].pending.businessProcess
					storeStatusData(stepResult.pending, 'businessProcess', stepData.pending);

					stepData.pending.forEach(function (bpId) {
						var certificates = data.businessProcesses.get(bpId).certificates;

						certificates.forEach(function (certificateName) {
							// 3.1.2 [serviceName].processingStep[stepName].pending.certificate[certificateName]
							storeStatusData(stepResult.pending.certificate, certificateName, stepData.pending);
						});
					});

					oForEach(stepData.byProcessor, function (byProcessorData, processorId) {
						var processorResult;

						if (!stepResult.byProcessor[processorId]) stepResult.byProcessor[processorId] = {};

						processorResult = stepResult.byProcessor[processorId];

						oForEach(byProcessorData, function (statusData, status) {
							var statusResult;

							if (!processorResult[status]) processorResult[status] = { certificate: {} };

							statusResult = processorResult[status];

							// 3.2.1 [serviceName].processingStep[stepName]
							//           .byProcessor[processorId][status].businessProcess
							storeStatusData(statusResult, 'businessProcess', statusData);

							statusData.forEach(function (bpId) {
								var certificates = data.businessProcesses.get(bpId).certificates;

								certificates.forEach(function (certificateName) {
									// 3.2.2 [serviceName].processingStep[stepName]
									//           .byProcessor[processorId][status].certificate[certificateName]
									storeStatusData(statusResult.certificate, certificateName, statusData);
								});
							});
						});
					});
				});
			}
		});
	});

	var eachStatusSetToSum = function (dataSet) {
		Object.keys(dataSet).forEach(function (status) {
			if (isSet(dataSet[status])) {
				dataSet[status] = dataSet[status].size;
			}
		});
	};

	oForEach(resultMap, function (serviceResult) {
		// 1 [serviceName].businessProcess[status]
		eachStatusSetToSum(serviceResult.businessProcess);

		// 2 [serviceName].certificate[certificateName][status]
		oForEach(serviceResult.certificate, eachStatusSetToSum);

		oForEach(serviceResult.processingStep, function (stepResult) {
			// 3.1.1 [serviceName].processingStep[stepName].pending.businessProcess
			stepResult.pending.businessProcess = stepResult.pending.businessProcess.size;
			// 3.1.2 [serviceName].processingStep[stepName].pending.certificate[certificateName]
			oForEach(stepResult.pending, eachStatusSetToSum);

			oForEach(stepResult.byProcessor, function (processorResult) {
				// 3.2.1 [serviceName].processingStep[stepName]
				//           .byProcessor[processorId][status].businessProcess
				oForEach(processorResult, eachStatusSetToSum);

				oForEach(processorResult, function (statusResult) {
					// 3.2.2 [serviceName].processingStep[stepName]
					//           .byProcessor[processorId][status].certificate[certificateName]
					oForEach(statusResult, eachStatusSetToSum);
				});
			});
		});
	});

	return resultMap;
};

module.exports = memoize(function (dateFrom, dateTo) {
	var driver    = require('mano').dbDriver
	  , startTime = Date.now();

	return getData(driver)(function (data) {
		return calculate(getDateMap(data), data, dateFrom, dateTo);
	}).aside(function () {
		debugLoad('%s - %s calculate status events sums (in %s)', dateFrom, dateTo, humanize(Date.now() - startTime));
	});
}, {
	max: 1000,
	maxAge: env.statisticsResolution || 1000 * 60 * 60 * 24, // 24 hours by default
	promise: true,
	primitive: true
});
