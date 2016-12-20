'use strict';

var copy                = require('es5-ext/object/copy')
  , ensureObject        = require('es5-ext/object/valid-object')
  , forEach             = require('es5-ext/object/for-each')
  , capitalize          = require('es5-ext/string/#/capitalize')
  , db                  = require('../../db')
  , _                   = require('mano').i18n.bind('Statistics time per role pdf')
  , resolveFullStepPath = require('../../utils/resolve-processing-step-full-path');

var resolveDays = function (time) { return time / (1000 * 60 * 60 * 24); };

module.exports = function (result, config) {
	var processingStepsMeta = ensureObject(ensureObject(config).processingStepsMeta);
	var data = [];

	forEach(result.steps.byStep, function (stepData, key) {
		var step = stepData.processing;
		step.label =  db['BusinessProcess' +
			capitalize.call(processingStepsMeta[key]._services[0])].prototype
			.processingSteps.map.getBySKeyPath(resolveFullStepPath(key)).label;

		data.push(step);
	});

	var total, processingTotal, correctionTotal, correctionByUsers;
	correctionTotal         = result.businessProcesses.correction;
	correctionTotal.label   = _("Total correcting time");
	correctionByUsers       = copy(result.businessProcesses.correction);
	correctionByUsers.label = _("Corrections by the users");
	processingTotal         = result.businessProcesses.processing;
	processingTotal.label   = _("Total process without corrections");

	total                   = copy(result.businessProcesses.processing);
	total.label             = _("Total process");

	data.push(correctionTotal, correctionByUsers, processingTotal, total);

	return data.map(function (row) {
		return [
			JSON.stringify(row.label),
			row.timedCount,
			row.timedCount ? resolveDays(row.avgTime) : '',
			row.timedCount ? resolveDays(row.minTime) : '',
			row.timedCount ? resolveDays(row.maxTime) : ''
		].join();
	}).join('\n');
};
