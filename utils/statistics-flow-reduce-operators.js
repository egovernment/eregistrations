'use strict';

/**
 * It's about reduction
 *
 * FROM:
 *
 * [date][serviceName].processingStep[stepName].byProcessor[processorId][status].businessProcess =
 * num;
 * [date][serviceName].processingStep[stepName].byProcessor[processorId][status].certificate[name] =
 * num;
 *
 * TO:
 * [date][processorId] = {
 *  processor: processorId,
 *  date: "YYYY-MM-DD",
 *  approved: num,
 *  rejected: num,
 *  sentBack: num,
 *  processed: num
 *  }
 *
 */

var identity = require('es5-ext/function/identity')
  , toArray  = require('es5-ext/object/to-array');

var isEmptyResult = function (processorRow) {
	if (!processorRow) return true;
	return !processorRow.approved && !processorRow.rejected &&
		!processorRow.sentBack;
};

var buildResultByProcessor = function (row, currentRow, certificate, processorId, date) {
	var result = currentRow || {
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

module.exports = function (data, query) {
	var service, step, processor, certificate, finalResult, reducedRows, processorRow;
	service     = query.service;
	step        = query.step;
	processor   = query.processor;
	certificate = query.certificate;
	finalResult = {};

	Object.keys(data).forEach(function (date) {
		finalResult[date] = {};

		reducedRows = service ? [data[date][service]] : toArray(data[date], identity);

		reducedRows = reducedRows.map(function (row) {
			return row.processingStep[step].byProcessor;
		});

		reducedRows.forEach(function (reducedRow) {
			if (processor) {
				processorRow = reducedRow[processor];
				if (isEmptyResult(processorRow)) return;
				finalResult[date][processor] =
					buildResultByProcessor(processorRow, finalResult[date][processor],
						certificate, processor, date);
			} else {
				Object.keys(reducedRow).forEach(function (processorId) {
					processorRow = reducedRow[processorId];
					if (isEmptyResult(processorRow)) return;
					finalResult[date][processorId] =
						buildResultByProcessor(processorRow, finalResult[date][processorId],
							certificate, processorId, date);
				});
			}
		});
	});

	return finalResult;
};
