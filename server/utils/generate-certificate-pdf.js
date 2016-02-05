'use strict';

var path                    = require('path')
  , htmlToPdf               = require('eregistrations/server/html-to-pdf')
  , generateThumbAndPreview = require('eregistrations/server/generate-thumb-and-preview')
  , generateId              = require('time-uuid')
  , ensureString            = require('es5-ext/object/validate-stringifiable-value')
  , ensureDbjsObject        = require('dbjs/valid-dbjs-object')

  , resolve = path.resolve;

/**
 *
 * @param {object} config
 * nameSuffix       {string} - suffix of preview file name i.e '-my-cert.pdf',
 * businessProcess  {object} - relative to bp i.e. 'certificates/map/myCert/dataForm/lastEditStamp',
 * previewFile      {object} - certificate's previewFile
 * previewFilePath  {string} - path to certificates preview file relative to bp
 *                             i.e. 'certificates/map/my-cert/previewFile',
 *                             you can specify this instead of previewFile
 * uploadsPath               - absolute path to project's uploads folder
 * templatePath              - absolute path to html template of the preview
 */

module.exports = function (config) {
	var filePath, fullFilePath, nameSuffix, businessProcess, previewFile
	  , templatePath, uploadsPath;

	config          = Object(config);
	nameSuffix      = ensureString(config.nameSuffix);
	businessProcess = ensureDbjsObject(config.businessProcess);
	uploadsPath     = resolve(ensureString(config.uploadsPath));
	templatePath    = resolve(ensureString(config.templatePath));
	if (config.previewFile) {
		previewFile = ensureDbjsObject(config.previewFile);
	} else {
		previewFile = businessProcess.resolveSKeyPath(ensureString(config.previewFilePath)).value;
	}

	filePath     = generateId() + nameSuffix;
	fullFilePath = resolve(uploadsPath, filePath);

	return htmlToPdf(templatePath, fullFilePath, {
		templateInserts: { businessProcess: businessProcess }
	})(function () {
		previewFile.path = filePath;
		return generateThumbAndPreview(previewFile);
	})(function () {
		return { filepath: fullFilePath };
	});
};
