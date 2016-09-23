'use strict';

var ensureObject         = require('es5-ext/object/valid-object')
  , forEach              = require('es5-ext/object/for-each')
  , capitalize           = require('es5-ext/string/#/capitalize')
  , debug                = require('debug-ext')('pdf-generator')
  , ensureDriver         = require('dbjs-persistence/ensure-driver')
  , db                   = require('../../../db')
  , _                    = require('mano').i18n.bind('Statistics time per role pdf')
  , resolveFullStepPath  = require('../../../utils/resolve-processing-step-full-path')
  , getDurationDaysHours = require('../../../view/utils/get-duration-days-hours');

module.exports = function (configData) {
	var options = {
		logo: configData.logo,
		driver: ensureDriver(configData.driver),
		db: db,
		processingStepsMeta: ensureObject(configData.processingStepsMeta),
		customFilter: configData.customFilter
	};

	return {
		headers: {
			'Cache-Control': 'no-cache',
			'Content-Type': 'text/csv; charset=utf-8'
		},
		controller: function (result) {
			var inserts = { data: [], locale: db.locale,
				logo: options.logo, currentDate: db.DateTime().toString() };

			debug('Generating statistics time per role csv');

			forEach(result.steps.byStep, function (data, key) {
				var step = data.processing;
				step.label =  db['BusinessProcess' +
					capitalize.call(options.processingStepsMeta[key]._services[0])].prototype
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

			total                   = result.businessProceesses.processing;
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

			return inserts.data.map(function (row) {
				return [
					row.label,
					row.count,
					row.avgTime,
					row.minTime,
					row.maxTime
				].join();
			}).join('\n');
		}
	};
};
