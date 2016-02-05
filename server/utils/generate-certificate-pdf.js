'use strict';

var path                    = require('path')
  , htmlToPdf               = require('eregistrations/server/html-to-pdf')
  , generateThumbAndPreview = require('eregistrations/server/generate-thumb-and-preview')
  , generateId              = require('time-uuid')
  , ensureString            = require('es5-ext/object/validate-stringifiable-value')
  , ensureObject            = require('es5-ext/object/valid-object')
  , ensureCallable          = require('es5-ext/object/valid-callable')

  , resolve = path.resolve;

/**
 *
 * @param {object} config
 * nameSuffix       {string}   - suffix of preview file name i.e '-my-cert.pdf',
 * inserts          {object}   - hash of variables exposed in template,
 * previewFile      {object}   - certificate's previewFile
 * resolutionObject {object}   - object to resolve path on, needed only when no previewFile is given
 * previewFilePath  {string}   - path to certificates preview file relative to bp
 *                               i.e. 'certificates/map/my-cert/previewFile',
 *                               you can specify this instead of previewFile
 * insertsResolver  {function} - optional, receives resolutionObject and
 *                               returns template variables hash
 * uploadsPath      {string}   - absolute path to project's uploads folder
 * templatePath     {string}   - absolute path to html template of the preview
 */

module.exports = function (config) {
	var filePath, fullFilePath, nameSuffix, previewFile
	  , templatePath, uploadsPath, context;

	config          = Object(config);
	nameSuffix      = ensureString(config.nameSuffix);
	uploadsPath     = resolve(ensureString(config.uploadsPath));
	templatePath    = resolve(ensureString(config.templatePath));
	previewFile     = ensureObject(config.resolutionObject).resolveSKeyPath(
		ensureString(config.previewFilePath)
	).value;

	if (config.insertsResolver) {
		context = ensureCallable(config.insertsResolver)(config.resolutionObject);
	} else {
		context = config.resolutionObject;
	}

	filePath     = generateId() + nameSuffix;
	fullFilePath = resolve(uploadsPath, filePath);

	return htmlToPdf(templatePath, fullFilePath, {
		templateInserts: { context: context }
	})(function () {
		previewFile.path = filePath;
		return generateThumbAndPreview(previewFile);
	})(function () {
		return { filepath: fullFilePath };
	});
};
