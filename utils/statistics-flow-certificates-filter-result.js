'use strict';

/**
 * It's about transformation
 *
 * FROM:
 *
 * [date][serviceName].businessProcess[status] = num;
 * [date][serviceName].certificate[name][status] = num;
 *
 * TO:
 * [date] = {
 *  submitted: num,
 *  pending: num,
 *  pickup: num,
 *  withdrawn: num,
 *  rejected: num,
 *  sentBack: num
 *  }
 *
 */

var buildResultRow = function (rowData) {
	var result = {
		submitted: 0,
		pending: 0,
		pickup: 0,
		withdrawn: 0,
		rejected: 0,
		sentBack: 0
	};
	Object.keys(result).forEach(function (key) {
		if (rowData && rowData[key] != null) {
			result[key] = rowData[key];
		}
	});

	return result;
};

var accumulateResultRows = function (rows) {
	var result = buildResultRow(rows[0]);
	rows.slice(1).forEach(function (row) {
		Object.keys(row).forEach(function (propertyName) {
			if (result[propertyName] != null) {
				result[propertyName] += row[propertyName];
			}
		});
	});

	return result;
};

var buildFilteredResult = function (data, key, service, certificate) {
	if (!data[key]) return buildResultRow();
	if (service) {
		if (!data[key][service]) return buildResultRow();
		if (certificate) {
			return buildResultRow(data[key][service].certificate[certificate]);
		}
		return buildResultRow(data[key][service].businessProcess);
	}
	var rowsToAccumulate = [];
	Object.keys(data[key]).forEach(function (service) {
		if (certificate) {
			if (!data[key][service].certificate[certificate]) return;
			rowsToAccumulate.push(data[key][service].certificate[certificate]);
		} else {
			rowsToAccumulate.push(data[key][service].businessProcess);
		}
	});
	return accumulateResultRows(rowsToAccumulate);
};

module.exports = function (data, query) {
	var result = {};

	Object.keys(data).forEach(function (date) {
		result[date] = buildFilteredResult(data, date, query.service, query.certificate);
	});

	return result;
};
