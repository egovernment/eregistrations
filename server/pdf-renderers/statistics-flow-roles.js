'use strict';

var ensureObject            = require('es5-ext/object/valid-object')
  , resolve                 = require('path').resolve
  , db                      = require('../../db')
  , htmlToPdf               = require('../html-to-pdf')
  , modes                   = require('../../utils/statistics-flow-group-modes')
  , processingSteps         = require('../../processing-steps-meta')
  , getStepLabelByShortPath = require('../../utils/get-step-label-by-short-path')

  , root = resolve(__dirname, '../..')
  , templatePath = resolve(root, 'apps-common/pdf-templates/statistics-flow-roles.html');

module.exports = function (result, config) {
	ensureObject(config);
	var inserts = {
		data: result,
		locale: db.locale,
		logo: config.logo,
		currentDate: db.DateTime().toString(),
		colLabels: [modes.get(config.mode || 'daily').labelNoun].concat(
			Object.keys(processingSteps).map(function (shortStepPath) {
				return getStepLabelByShortPath(shortStepPath);
			})
		)
	};

	return htmlToPdf(templatePath, '', {
		width: "297mm",
		height: "210mm",
		streamable: true,
		templateInserts: inserts
	});
};
