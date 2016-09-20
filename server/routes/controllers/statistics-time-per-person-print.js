'use strict';

var identity             = require('es5-ext/function/identity')
  , ensureObject         = require('es5-ext/object/valid-object')
  , assign               = require('es5-ext/object/assign')
  , toArray              = require('es5-ext/object/to-array')
  , capitalize           = require('es5-ext/string/#/capitalize')
  , deferred             = require('deferred')
  , ensureDatabase       = require('dbjs/valid-dbjs')
  , ensureDriver         = require('dbjs-persistence/ensure-driver')
  , resolve              = require('path').resolve
  , debug                = require('debug-ext')('pdf-generator')
  , _                    = require('mano').i18n.bind('Statistics time per person pdf')
  , resolveFullStepPath  = require('../../../utils/resolve-processing-step-full-path')
  , getDurationDaysHours = require('../../../view/utils/get-duration-days-hours')
  , getUserFullName      = require('../../utils/get-user-full-name')
  , htmlToPdf            = require('../../html-to-pdf')

  , root = resolve(__dirname, '../../..')
  , templatePath = resolve(root, 'apps-common/pdf-templates/statistics-time-per-person.html');

var getProcessingTimesByStepProcessor =
	require('../../statistics/business-process/query-times');

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

				return deferred.map(Object.keys(result.byStepAndProcessor), function (key) {
					var step = {}, total;
					step.data  = toArray(result.byStepAndProcessor[key], identity);
					step.label =  db['BusinessProcess' +
						capitalize.call(options.processingStepsMeta[key]._services[0])].prototype
						.processingSteps.map.getBySKeyPath(resolveFullStepPath(key)).label;

					inserts.steps.push(step);
					if (!step.data.length) return;
					total = {
						count: 0,
						avgTime: 0,
						minTime: Infinity,
						maxTime: 0,
						totalTime: 0
					};
					step.data.forEach(function (byProcessor) {
						byProcessor = byProcessor.processing;
						total.fullName = _("Total & times");
						total.count += byProcessor.count;
						total.totalTime += byProcessor.totalTime;
						total.minTime = Math.min(byProcessor.minTime, total.minTime);
						total.maxTime = Math.max(byProcessor.maxTime, total.maxTime);
					});
					total.avgTime = getDurationDaysHours(total.totalTime / total.count);
					total.minTime = getDurationDaysHours(total.minTime);
					total.maxTime = getDurationDaysHours(total.maxTime);
					return deferred.map(step.data, function (item) {
						item = item.processing;
						item.avgTime = getDurationDaysHours(item.avgTime);
						item.minTime = getDurationDaysHours(item.minTime);
						item.maxTime = getDurationDaysHours(item.maxTime);

						return getUserFullName(item.processor)(function (fullName) {
							item.fullName = fullName;
							step.data.push({ processing: total });
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
