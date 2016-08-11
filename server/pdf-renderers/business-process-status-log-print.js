'use strict';

var db             = require('../../db')
  , assign         = require('es5-ext/object/assign')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , resolve        = require('path').resolve
  , queryMemoryDb  = require('mano').queryMemoryDb
  , isUserApp      = require('../../utils/is-user-app')
  , root           = resolve(__dirname, '../..')
  , templatePath   =
			resolve(root, 'apps-common/pdf-templates/business-process-status-log-print.html')
  , htmlToPdf      = require('../html-to-pdf');

module.exports = function (businessProcessId/*, options */) {
	var options = normalizeOptions(arguments[1]);
	if (!businessProcessId) return null;
	return queryMemoryDb([businessProcessId], 'businessProcessStatusLog', {
		businessProcessId: businessProcessId
	})(function (businessProcess) {
		if (!businessProcess) return null;
		businessProcess.statusLog.forEach(function (statusLog) {
			// we don't show officials to end users
			if (statusLog.official && isUserApp(options.appName || '')) {
				statusLog.official = null;
			}
		});
		var inserts = {
			statusLog: businessProcess.statusLog,
			businessName: businessProcess.businessName,
			locale: db.locale,
			logo: options.logo,
			currentDate: db.DateTime().toString()
		};

		return htmlToPdf(templatePath, '', assign({
			width: "210mm",
			height: "297mm",
			templateInserts: inserts
		}, options));
	});
};
