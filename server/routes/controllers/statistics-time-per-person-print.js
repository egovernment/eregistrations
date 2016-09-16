'use strict';

var debug               = require('debug-ext')('pdf-generator')
  , deferred            = require('deferred')
  , ensureDriver        = require('dbjs-persistence/ensure-driver')
  , ensureDatabase      = require('dbjs/valid-dbjs')
  , ensureObject        = require('es5-ext/object/valid-object')
  , assign              = require('es5-ext/object/assign')
  , _                   = require('mano').i18n.bind('Statistics time per person pdf')
  , resolve             = require('path').resolve
  , capitalize          = require('es5-ext/string/#/capitalize')
  , resolveFullStepPath = require('../../../utils/resolve-processing-step-full-path')
  , root                = resolve(__dirname, '../..')
  , getProcessingTimesByStepProcessor =
		require('../../statistics/step-processing-times/filter')
  , templatePath        = resolve(root, 'apps-common/pdf-templates/statistics-time-per-person.html')
  , getDurationDaysHours = require('../../../view/utils/get-duration-days-hours')
  , getUserFullName     = require('../../utils/get-user-full-name')
  , htmlToPdf           = require('../../html-to-pdf');

module.exports = function (configData) {
	var options, db = ensureDatabase(configData.db);
	options = {
		logo: configData.logo,
		driver: ensureDriver(configData.driver),
		db: db,
		processingStepsMeta: ensureObject(configData.processingStepsMeta),
		customFilter: configData.customFilter
	};

	return {
		headers: {
			'Cache-Control': 'no-cache',
			'Content-Type': 'application/pdf; charset=utf-8'
		},
		controller: function (query) {
			return getProcessingTimesByStepProcessor(assign(options, query))(function (result) {
				var inserts = { steps: [], locale: db.locale,
					logo: options.logo, currentDate: db.DateTime().toString() };
				debug('Generating statistics time per person');
				return deferred.map(Object.keys(result.byProcessor), function (key) {
					var step = {}, total;
					step.data  = result.byProcessor[key];
					step.label =  db['BusinessProcess' +
						capitalize.call(options.processingStepsMeta[key]._services[0])].prototype
						.processingSteps.map.getBySKeyPath(resolveFullStepPath(key)).label;

					inserts.steps.push(step);
					if (!step.data.length) return;
					total = {
						processed: 0,
						avgTime: 0,
						minTime: Infinity,
						maxTime: 0,
						totalTime: 0
					};
					step.data.forEach(function (byProcessor) {
						total.fullName = _("Total & times");
						total.processed += byProcessor.processed;
						total.totalTime += byProcessor.totalTime;
						total.minTime = Math.min(byProcessor.minTime, total.minTime);
						total.maxTime = Math.max(byProcessor.maxTime, total.maxTime);
					});
					total.avgTime = getDurationDaysHours(total.totalTime / total.processed);
					total.minTime = getDurationDaysHours(total.minTime);
					total.maxTime = getDurationDaysHours(total.maxTime);
					return deferred.map(step.data, function (item) {
						item.avgTime = getDurationDaysHours(item.avgTime);
						item.minTime = getDurationDaysHours(item.minTime);
						item.maxTime = getDurationDaysHours(item.maxTime);

						return getUserFullName(item.processor)(function (fullName) {
							item.fullName = fullName;
							step.data.push(total);
						});
					});
				})(function () {
					return htmlToPdf(templatePath, '', {
						width: "297mm",
						height: "210mm",
						streamable: true,
						templateInserts: inserts
					});
				});
			});
		}
	};
};
