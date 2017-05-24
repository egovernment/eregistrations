'use strict';

var ensureObject         = require('es5-ext/object/valid-object')
  , resolve              = require('path').resolve
  , db                   = require('../../db')
  , getDurationDaysHours = require('../../view/utils/get-duration-days-hours-fine-grain')
  , htmlToPdf            = require('../html-to-pdf')

  , root = resolve(__dirname, '../..')
  , templatePath = resolve(root, 'apps-common/pdf-templates/statistics-time-per-person.html');

module.exports = function (result, config) {
	ensureObject(config);
	var inserts = { steps: [], locale: db.locale,
		logo: config.logo, currentDate: db.DateTime().toString() };

	Object.keys(result).forEach(function (key) {
		var step = { label: result[key].label };
		inserts.steps.push(step);
		step.data = [];
		Object.keys(result[key].rows).forEach(function (rowId) {
			var item = result[key].rows[rowId].processing || result[key].rows.totalProcessing;
			item.avgTime = item.timedCount ? getDurationDaysHours(item.avgTime) : '-';
			item.minTime = item.timedCount ? getDurationDaysHours(item.minTime) : '-';
			item.maxTime = item.timedCount ? getDurationDaysHours(item.maxTime) : '-';
			step.data.push({ processing: item });
		});
	});

	return htmlToPdf(templatePath, '', {
		width: "297mm",
		height: "210mm",
		streamable: true,
		templateInserts: inserts
	});
};
