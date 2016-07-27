'use strict';

var debug               = require('debug-ext')('pdf-generator')
  , deferred            = require('deferred')
  , ensureDriver        = require('dbjs-persistence/ensure-driver')
  , ensureDatabase      = require('dbjs/valid-dbjs')
  , ensureObject        = require('es5-ext/object/valid-object')
  , assign              = require('es5-ext/object/assign')
  , _                   = require('mano').i18n.bind('Statistics time per role pdf')
  , resolve             = require('path').resolve
  , capitalize          = require('es5-ext/string/#/capitalize')
  , resolveFullStepPath = require('../../utils/resolve-processing-step-full-path')
  , root                = resolve(__dirname, '../..')
  , getProcessingTimesByStepProcessor =
		require('../statistics/get-processing-times-by-step-processor')
  , templatePath        = resolve(root, 'apps-common/pdf-templates/statistics-time-per-role.html')
  , getDurationDaysHours = require('../../view/utils/get-duration-days-hours')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , htmlToPdf           = require('../html-to-pdf');

module.exports = function (configData) {
	var options, db = ensureDatabase(configData.db);
	options = {
		logo: configData.logo,
		driver: ensureDriver(configData.driver),
		db: db,
		processingStepsMeta: ensureObject(configData.processingStepsMeta)
	};

	return {
		headers: {
			'Cache-Control': 'no-cache',
			'Content-Type': 'application/pdf; charset=utf-8'
		},
		controller: function (query) {
			return getProcessingTimesByStepProcessor(assign(options, query))(function (result) {
				var inserts = { data: [], locale: db.locale,
					logo: options.logo, currentDate: db.DateTime().toString() };
				debug('Generating statistics time per role');
				return deferred.map(Object.keys(result.byProcessor), function (key) {
					var step;
					step       = result.byProcessor[key];
					step.label =  db['BusinessProcess' +
						capitalize.call(options.processingStepsMeta[key]._services[0])].prototype
						.processingSteps.map.getBySKeyPath(resolveFullStepPath(key)).label;

					inserts.data.push(step);
					if (!step.data.length) return;
					step.data.forEach(function (item) {
						item.avgTime = getDurationDaysHours(item.avgTime);
						item.minTime = getDurationDaysHours(item.minTime);
						item.maxTime = getDurationDaysHours(item.maxTime);
					});
				})(function () {
					var total, processingTotal, correctionTotal, correctionByUsers;
					correctionTotal         = result.byBusinessProcess.correctionTotal;
					correctionTotal.label   = _("Total correcting time");
					correctionByUsers       = normalizeOptions(result.byBusinessProcess.correctionTotal);
					correctionByUsers.label = _("Corrections by the users");
					processingTotal         = result.byBusinessProcess.totalProcessing;
					processingTotal.label   = _("Total process without corrections");
					total                   = result.byBusinessProcess.total;
					total.label             = _("Total process");
					[correctionTotal, correctionByUsers, processingTotal, total].forEach(
						function (totalItem) {
							if (totalItem.avgTime) {
								totalItem.avgTime = getDurationDaysHours(totalItem.avgTime);
							}
							if (totalItem.minTime) {
								totalItem.minTime = getDurationDaysHours(totalItem.minTime);
							}
							if (totalItem.maxTime) {
								totalItem.maxTime = getDurationDaysHours(totalItem.maxTime);
							}
							inserts.data.push(totalItem);
						}
					);
				})(function () {
					return htmlToPdf(templatePath, '', {
						width: "210mm",
						height: "170mm",
						streamable: true,
						templateInserts: inserts
					});
				});
			});
		}
	};
};
