'use strict';

var generateDocumentPrev = require('../utils/generate-pdf')
  , normalizeOptions     = require('es5-ext/object/normalize-options')
  , deferred             = require('deferred')
  , setupTriggers        = require('../_setup-triggers')
  , ensureCallable       = require('es5-ext/object/valid-callable')
  , ensureString         = require('es5-ext/object/validate-stringifiable-value');

/**
 *
 * @param {object} config
 * entryCollection   {set}      - the collection of businessProcesses filtered by entry condition
 *                                (which objects are to be taken into account)
 * nameSuffix        {string}   - suffix of preview file name i.e '-my-file.pdf',
 * previewFilePath   {string}   - path to document's preview file relative to resolution object
 *                                i.e. 'certificates/map/my-cert/previewFile',
 *                                you can specify this instead of previewFile
 * insertsResolver   {function} - optional, receives resolutionObject and
 *                                returns template variables hash
 * uploadsPath       {string}   - absolute path to project's uploads folder
 * templatePath      {string}   - absolute path to html template of the preview
 */

module.exports = function (config) {
	var onUpdate, entryCollection;
	entryCollection = config.entryCollection;
	ensureString(config.previewFilePath);
	if (config.insertsResolver) {
		ensureCallable(config.insertsResolver);
	}

	onUpdate = function (resolutionObject) {
		return deferred(
			(function () {
				var fileObj, inserts, localConfig;
				fileObj = resolutionObject.resolveSKeyPath(
					config.previewFilePath
				).value;
				localConfig = normalizeOptions(config, { fileObj: fileObj });
				if (config.insertsResolver) {
					inserts = config.insertsResolver(resolutionObject);
				} else {
					inserts = resolutionObject;
				}
				localConfig.inserts = inserts;

				return generateDocumentPrev(localConfig);
			}())
		).done();
	};

	setupTriggers({ trigger: entryCollection }, onUpdate);
};
