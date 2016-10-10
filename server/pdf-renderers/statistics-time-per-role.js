'use strict';

var copy                 = require('es5-ext/object/copy')
  , forEach              = require('es5-ext/object/for-each')
  , ensureObject         = require('es5-ext/object/valid-object')
  , capitalize           = require('es5-ext/string/#/capitalize')
  , resolve              = require('path').resolve
  , _                    = require('mano').i18n.bind('Statistics time per role pdf')
  , db                   = require('../../db')
  , resolveFullStepPath  = require('../../utils/resolve-processing-step-full-path')
  , getDurationDaysHours = require('../../view/utils/get-duration-days-hours')
  , htmlToPdf            = require('../html-to-pdf')

  , root = resolve(__dirname, '../..')
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
		step.avgTime = step.count ? getDurationDaysHours(step.avgTime) : '-';
		step.minTime = step.count ? getDurationDaysHours(step.minTime) : '-';
		step.maxTime = step.count ? getDurationDaysHours(step.maxTime) : '-';
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

	[correctionTotal, correctionByUsers, processingTotal, total].forEach(
		function (totalItem) {
			if (!totalItem.count) {
				totalItem.avgTime = totalItem.minTime = totalItem.maxTime = "-";
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
