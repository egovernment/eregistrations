'use strict';

var ensureObject         = require('es5-ext/object/valid-object')
  , capitalize           = require('es5-ext/string/#/capitalize')
  , deferred             = require('deferred')
  , resolve              = require('path').resolve
  , _                    = require('mano').i18n.bind('Statistics time per person pdf')
  , db                   = require('../../db')
  , resolveFullStepPath  = require('../../utils/resolve-processing-step-full-path')
  , getDurationDaysHours = require('../../view/utils/get-duration-days-hours')
  , getUserFullName      = require('../utils/get-user-full-name')
  , htmlToPdf            = require('../html-to-pdf')

  , root = resolve(__dirname, '../..')
  , templatePath = resolve(root, 'apps-common/pdf-templates/statistics-time-per-person.html');

module.exports = function (result, config) {
	var processingStepsMeta = ensureObject(ensureObject(config).processingStepsMeta);
	var inserts = { steps: [], locale: db.locale,
		logo: config.logo, currentDate: db.DateTime().toString() };

	return deferred.map(Object.keys(result.byStep), function (key) {
		var step = {}, total;
		step.label =  db['BusinessProcess' +
			capitalize.call(processingStepsMeta[key]._services[0])].prototype
			.processingSteps.map.getBySKeyPath(resolveFullStepPath(key)).label;

		inserts.steps.push(step);
		total = result.byStep[key].processing;
		total.fullName = _("Total & times");
		total.avgTime = getDurationDaysHours(total.totalTime / total.count);
		total.minTime = getDurationDaysHours(total.minTime);
		total.maxTime = getDurationDaysHours(total.maxTime);
		return deferred.map(Object.keys(result.byStepAndProcessor[key]), function (userId) {
			var item = result.byStepAndProcessor[key][userId].processing;
			item.avgTime = getDurationDaysHours(item.avgTime);
			item.minTime = getDurationDaysHours(item.minTime);
			item.maxTime = getDurationDaysHours(item.maxTime);

			return getUserFullName(userId)(function (fullName) {
				item.fullName = fullName;
				return { processing: item };
			});
		})(function (data) {
			step.data = data;
			data.push({ processing: total });
		});
	})(function () {
		return htmlToPdf(templatePath, '', {
			width: "297mm",
			height: "210mm",
			streamable: true,
			templateInserts: inserts
		});
	});
};
