'use strict';

var ensureObject         = require('es5-ext/object/valid-object')
  , resolve              = require('path').resolve
  , db                   = require('../../db')
  , htmlToPdf            = require('../html-to-pdf')
  , _                    = require('mano').i18n

  , root = resolve(__dirname, '../..')
  , templatePath = resolve(root, 'apps-common/pdf-templates/statistics-flow-rejections.html');

module.exports = function (result, config) {
	ensureObject(config);
	var inserts = { data: result, locale: db.locale,
		logo: config.logo, currentDate: db.DateTime().toString(),
		colLabels: [_("Rejection reasons"), "", "",
			_("Operator"), _("Role"), _("Date"), _("File")
			]
		};

	return htmlToPdf(templatePath, '', {
		width: "297mm",
		height: "210mm",
		streamable: true,
		templateInserts: inserts
	});
};
