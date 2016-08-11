'use strict';

var db             = require('../../db')
  , assign         = require('es5-ext/object/assign')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , resolve        = require('path').resolve
  , queryMemoryDb  = require('mano').queryMemoryDb
  , root           = resolve(__dirname, '../..')
  , templatePath   =
			resolve(root, 'apps-common/pdf-templates/print-business-process-status-log.html')
  , htmlToPdf      = require('../html-to-pdf');

module.exports = function (businessProcessId/*, options */) {
	var options = normalizeOptions(arguments[1]);
	if (!businessProcessId) return null;
	return queryMemoryDb([businessProcessId], 'businessProcessStatusLog', {
		businessProcessId: businessProcessId
	})(function (businessProcess) {
		if (!businessProcess) return null;
		var inserts = {
			statusLog: businessProcess.statusLog,
			businessName: businessProcess.businessName,
			locale: db.locale,
			logo: null,
			currentDate: db.DateTime().toString()
		};

		return htmlToPdf(templatePath, '', assign({
			width: "210mm",
			height: "297mm",
			templateInserts: inserts
		}, options));
	});
};
