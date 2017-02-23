'use strict';

/**
 * It's about transformation
 *
 * FROM:
 *
 * [date][serviceName][stepName][status].businessProcess   = num;
 * [date][serviceName][stepName][status].certificate[name] = num;
 *
 * (result of ./statistics-flow-reduce-processing-step)
 *
 * TO:
 * [date][stepName] = num;
 *
 */

var db              = require('../db')
  , processingSteps = require('../processing-steps-meta')
  , uncapitalize    = require('es5-ext/string/#/uncapitalize');

var getServiceName = function (ServiceType) {
	return uncapitalize.call(
		ServiceType.__id__.slice('BusinessProcess'.length)
	);
};

// We consider step not applicable when it doesn't have given status or
// it does not belong to selected service
var isStepApplicable = function (stepKey, queryService, queryStatus) {
	if (!processingSteps[stepKey]._services.some(function (service) {
			return service === queryService;
		})) {
		return false;
	}

	return Object.keys(processingSteps[stepKey]).some(function (status) {
		return status === queryStatus;
	});
};

var buildResultRow = function (rowData, queryService, queryCertificate, queryStatus) {
	var resultRow = {}, reducedRowData;
	Object.keys(processingSteps).forEach(function (stepKey) {
		resultRow[stepKey] = isStepApplicable(stepKey, queryService, queryStatus) ? 0 : null;
	});
	Object.keys(rowData).forEach(function (stepShortPath) {
		if (resultRow[stepShortPath] == null || rowData[stepShortPath][queryStatus] == null) {
			return;
		}

		reducedRowData = rowData[stepShortPath][queryStatus];
		if (queryCertificate) {
			reducedRowData = reducedRowData.certificate[queryCertificate] || 0;
		} else {
			reducedRowData = reducedRowData.businessProcess || 0;
		}
		resultRow[stepShortPath] = reducedRowData;
	});

	return resultRow;
};

var buildFilteredResult = function (data, key, service, certificate, status) {
	var resultRow, finalResult = {};
	if (service) {
		return buildResultRow(data[key][service] || {}, service, certificate, status);
	}

	db.BusinessProcess.extensions.forEach(function (ServiceType) {
		var serviceName = getServiceName(ServiceType);
		resultRow = buildResultRow(data[key][serviceName] || {}, serviceName, certificate, status);
		// accumulate
		Object.keys(resultRow).forEach(function (stepShortPath) {
			if (resultRow[stepShortPath] == null) {
				if (finalResult[stepShortPath] == null) {
					finalResult[stepShortPath] = null;
				}
				return;
			}
			if (!finalResult[stepShortPath]) {
				finalResult[stepShortPath] = 0;
			}
			finalResult[stepShortPath] += resultRow[stepShortPath];
		});
	});

	return finalResult;
};

module.exports = function (data, query) {
	var result = {};
	Object.keys(data).forEach(function (date) {
		result[date] = buildFilteredResult(data, date,
			query.service, query.certificate, query.status);
	});

	return result;
};
