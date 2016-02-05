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
 * name              {string}   - name i.e 'my-file',
 * fileKeyPath       {string}   - keyPath to file property, relative to resolution object
 *                                i.e. 'certificates/map/my-cert/previewFile',
 * insertsResolver   {function} - optional, receives resolutionObject and
 *                                returns template variables hash
 * dirpath           {string}   - absolute path to directory in which
 *                                generated files will be stored
 * templatePath      {string}   - absolute path to html template of the preview
 */

module.exports = function (config) {
	var onUpdate, entryCollection;
	entryCollection = config.entryCollection;
	ensureString(config.fileKeyPath);
	if (config.insertsResolver) {
		ensureCallable(config.insertsResolver);
	}

	onUpdate = function (resolutionObject) {
		return deferred(
			(function () {
				var fileObj, inserts, localConfig;
				fileObj = resolutionObject.resolveSKeyPath(
					config.fileKeyPath
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
