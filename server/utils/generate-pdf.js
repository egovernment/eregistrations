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
 * name                 {string}  - suffix of preview file name i.e 'my-file',
 * inserts              {object}  - hash of variables exposed in template,
 * fileObj              {object}  - file for which we generate pdf
 * dirpath              {string}  - absolute path to directory in which
 *                                  generated files will be stored
 * templatePath         {string}  - absolute path to html template of the pdf
 * disableRandomPostfix {boolean} - when true only name will be used as pdf's name,
 *                                  otherwise we append unique generated id
 */

module.exports = function (config) {
	var filePath, fullFilePath, name, fileObj
	  , templatePath, dirpath, inserts;

	config       = ensureObject(config);
	name         = ensureString(config.name);
	dirpath      = resolve(ensureString(config.dirpath));
	templatePath = resolve(ensureString(config.templatePath));
	fileObj      = ensureDbjsObject(config.fileObj);
	inserts      = ensureObject(config.inserts);

	filePath     = config.disableRandomPostfix ? name : name + '-' + generateId() + '.pdf';
	fullFilePath = resolve(dirpath, filePath);

	return htmlToPdf(templatePath, fullFilePath, {
		templateInserts: inserts
	})(function () {
		fileObj.path = filePath;
		return generateThumbAndPreview(fileObj);
	})(function () {
		return { filepath: fullFilePath };
	});
};
