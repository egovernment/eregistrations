'use strict';

var forEach              = require('es5-ext/object/for-each')
  , ensureObject         = require('es5-ext/object/valid-object')
  , capitalize           = require('es5-ext/string/#/capitalize')
  , resolve              = require('path').resolve
  , _                    = require('mano').i18n.bind('Statistics time per role pdf')
  , db                   = require('../../db')
  , resolveFullStepPath  = require('../../utils/resolve-processing-step-full-path')
  , getDurationDaysHours = require('../../view/utils/get-duration-days-hours')
  , htmlToPdf            = require('../html-to-pdf')

  , root = resolve(__dirname, '../../..')
  , templatePath = resolve(root, 'apps-common/pdf-templates/statistics-time-per-role.html');

module.exports = function (result, config) {
	var processingStepsMeta = ensureObject(ensureObject(config).processingStepsMeta);
	var inserts = { data: [], locale: db.locale,
		logo: config.logo, currentDate: db.DateTime().toString() };

	forEach(result.steps.byStep, function (data, key) {
		var step = data.processing;
		step.label =  db['BusinessProcess' +
			capitalize.call(processingStepsMeta[key]._services[0])].prototype
			.processingSteps.map.getBySKeyPath(resolveFullStepPath(key)).label;

		inserts.data.push(step);
		step.avgTime = getDurationDaysHours(step.avgTime);
		step.minTime = getDurationDaysHours(step.minTime);
		step.maxTime = getDurationDaysHours(step.maxTime);
	});

	var total, processingTotal, correctionTotal, correctionByUsers;
	correctionTotal         = result.steps.all.correction;
	correctionTotal.label   = _("Total correcting time");
	correctionByUsers       = result.steps.all.correction;
	correctionByUsers.label = _("Corrections by the users");
	processingTotal         = result.businessProceesses.processing;
	processingTotal.label   = _("Total process without corrections");

	total                   = result.businessProcesses.processing;
	total.label             = _("Total process");

	[correctionTotal, correctionByUsers, processingTotal, total].forEach(
		function (totalItem) {
			if (!totalItem.count) {
				totalItem.avgTime = totalItem.minTime = totalItem.maxTime = _("N/A");
			} else {
				totalItem.avgTime = getDurationDaysHours(totalItem.avgTime);
				totalItem.minTime = getDurationDaysHours(totalItem.minTime);
				totalItem.maxTime = getDurationDaysHours(totalItem.maxTime);
			}
			inserts.data.push(totalItem);
		}
	);

	return htmlToPdf(templatePath, '', {
		width: "297mm",
		height: "210mm",
		streamable: true,
		templateInserts: inserts
	});
};
