'use strict';

var debug               = require('debug-ext')('pdf-generator')
  , ensureDriver        = require('dbjs-persistence/ensure-driver')
  , ensureDatabase      = require('dbjs/valid-dbjs')
  , ensureObject        = require('es5-ext/object/valid-object')
  , assign              = require('es5-ext/object/assign')
  , _                   = require('mano').i18n.bind('Statistics time per role pdf')
  , resolve             = require('path').resolve
  , capitalize          = require('es5-ext/string/#/capitalize')
  , resolveFullStepPath = require('../utils/resolve-processing-step-full-path')
  , root                = resolve(__dirname, '../..')
  , getProcessingTimesByStepProcessor =
		require('../statistics/get-processing-times-by-step-processor')
  , templatePath        = resolve(root, 'apps-common/pdf-templates/statistics-time-per-role.html')
  , htmlToPdf           = require('../html-to-pdf');

module.exports = function (configData) {
	var options, db = ensureDatabase(configData.db);
	options = {
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
				var inserts = { steps: [] };
				debug('Generating statistics time per role');

				Object.keys(result).forEach(function (key) {
					var step, total;
					step       = result[key];
					step.label =  db['BusinessProcess' +
						capitalize.call(options.processingStepsMeta[key]._services[0])].prototype
						.processingSteps.map.getBySKeyPath(resolveFullStepPath(key)).label;
					step.forEach(function (item) {
						item.fullName = db.User.getById(item.id).fullName;
					});
					total = {
						processed: 0,
						avgTime: 0,
						minTime: Infinity,
						maxTime: 0,
						totalTime: 0
					};
					result[key].forEach(function (byProcessor) {
						total.fullName = _("Total & times");
						total.processed += byProcessor.processed;
						total.totalTime += byProcessor.totalTime;
						total.minTime = Math.min(byProcessor.minTime, total.minTime);
						total.maxTime = Math.max(byProcessor.maxTime, total.maxTime);
					});
					total.avgTime = total.totalTime / total.processed;
					step.push(total);
					inserts.steps.push(step);
				});

				return htmlToPdf(templatePath, '', {
					width: "210mm",
					height: "170mm",
					streamable: true,
					templateInserts: inserts
				});
			});
		}
	};
};
