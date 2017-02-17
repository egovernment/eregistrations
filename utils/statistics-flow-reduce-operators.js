'use strict';

var isEmptyResult = function (processorRow) {
	if (!processorRow) return true;
	return !processorRow.approved && !processorRow.rejected &&
		!processorRow.sentBack;
};

var buildResultByProcessor = function (row, certificate, processorId, date) {
	var result = {
		date: date,
		processor: processorId,
		processed: 0,
		approved: 0,
		sentBack: 0,
		rejected: 0
	};
	['approved', 'sentBack', 'rejected'].forEach(function (status) {
		if (!row[status]) return;
		if (!result[status]) {
			result[status] = 0;
		}
		if (!result.processed) {
			result.processed = 0;
		}
		if (certificate) {
			if (!row[status].certificate[certificate]) return;
			result[status] += row[status].certificate[certificate];
			result.processed += row[status].certificate[certificate];
		} else {
			result[status] += row[status].businessProcess;
			result.processed += row[status].businessProcess;
		}
	});

	return result;
};

module.exports = function (params) {
	var data, service, step, processor, certificate, finalResult, reducedRows, processorRow;
	data      = params.data;
	service   = params.service;
	step      = params.step;
	processor = params.processor;
	certificate = params.certificate;
	finalResult = {};

	Object.keys(data).forEach(function (date) {
		reducedRows = [data[date]];
		finalResult[date] = {};

		if (service) {
			reducedRows = reducedRows.map(function (reducedRow) {
				return reducedRow[service];
			});
		} else {
			reducedRows = Object.keys(reducedRows[0]).map(function (serviceName) {
				return reducedRows[0][serviceName];
			});
		}
		reducedRows = reducedRows.map(function (row) {
			return row.processingStep[step].byProcessor;
		});

		reducedRows.forEach(function (reducedRow) {
			if (processor) {
				processorRow = reducedRow[processor];
				if (isEmptyResult(processorRow)) return;
				finalResult[date][processor] =
					buildResultByProcessor(processorRow, certificate, processor, date);
			} else {
				Object.keys(reducedRow).forEach(function (processorId) {
					processorRow = reducedRow[processorId];
					if (isEmptyResult(processorRow)) return;
					finalResult[date][processorId] =
						buildResultByProcessor(processorRow, certificate, processorId, date);
				});
			}
		});
	});

	return finalResult;
};
