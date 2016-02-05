'use strict';

var path                    = require('path')
  , htmlToPdf               = require('eregistrations/server/html-to-pdf')
  , generateThumbAndPreview = require('eregistrations/server/generate-thumb-and-preview')
  , generateId              = require('time-uuid')
  , ensureString            = require('es5-ext/object/validate-stringifiable-value')
  , ensureObject            = require('es5-ext/object/valid-object')
  , ensureDbjsObject        = require('dbjs/valid-dbjs-object')

  , resolve = path.resolve;

/**
 *
 * @param {object} config
 * nameSuffix       {string} - suffix of preview file name i.e '-my-file.pdf',
 * inserts          {object} - hash of variables exposed in template,
 * previewFile      {object} - document's previewFile
 * uploadsPath      {string} - absolute path to project's uploads folder
 * templatePath     {string} - absolute path to html template of the preview
 */

module.exports = function (config) {
	var filePath, fullFilePath, nameSuffix, previewFile
	  , templatePath, uploadsPath, inserts;

	config       = Object(config);
	nameSuffix   = ensureString(config.nameSuffix);
	uploadsPath  = resolve(ensureString(config.uploadsPath));
	templatePath = resolve(ensureString(config.templatePath));
	previewFile  = ensureDbjsObject(config.previewFile);
	inserts      = ensureObject(config.inserts);

	filePath     = generateId() + nameSuffix;
	fullFilePath = resolve(uploadsPath, filePath);

	return htmlToPdf(templatePath, fullFilePath, {
		templateInserts: inserts
	})(function () {
		previewFile.path = filePath;
		return generateThumbAndPreview(previewFile);
	})(function () {
		return { filepath: fullFilePath };
	});
};
