'use strict';

var forEach              = require('es5-ext/object/for-each')
  , ensureObject         = require('es5-ext/object/valid-object')
  , resolve              = require('path').resolve
  , db                   = require('../../db')
  , getDurationDaysHours = require('../../view/utils/get-duration-days-hours-fine-grain')
  , htmlToPdf            = require('../html-to-pdf')

  , root = resolve(__dirname, '../..')
  , templatePath = resolve(root, 'apps-common/pdf-templates/statistics-time-per-role.html');

module.exports = function (result, config) {
	ensureObject(config);
	var inserts = { data: [], locale: db.locale,
		logo: config.logo, currentDate: db.DateTime().toString() };

	forEach(result, function (data, key) {
		var step = data.processing || data;
		step.label =  data.label;

		inserts.data.push(step);
		step.avgTime = step.timedCount ? getDurationDaysHours(step.avgTime) : '-';
		step.minTime = step.timedCount ? getDurationDaysHours(step.minTime) : '-';
		step.maxTime = step.timedCount ? getDurationDaysHours(step.maxTime) : '-';
	});

	return htmlToPdf(templatePath, '', {
		width: "297mm",
		height: "210mm",
		streamable: true,
		templateInserts: inserts
	});
};
