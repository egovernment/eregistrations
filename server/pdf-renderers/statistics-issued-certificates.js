'use strict';

var ensureObject            = require('es5-ext/object/valid-object')
  , resolve                 = require('path').resolve
  , db                      = require('../../db')
  , _                       = require('mano').i18n
  , htmlToPdf               = require('../html-to-pdf')

  , root = resolve(__dirname, '../..')
  , templatePath = resolve(root, 'apps-common/pdf-templates/statistics-issued-certificates.html');

module.exports = function (result, config) {
	ensureObject(config);
	var inserts = {
		data: result,
		locale: db.locale,
		logo: config.logo,
		currentDate: db.DateTime().toString(),
		colLabels: [_("Category"), _("Certificate"), _("Number of issued")]
	};

	return htmlToPdf(templatePath, '', {
		width: "297mm",
		height: "210mm",
		streamable: true,
		templateInserts: inserts
	});
};
