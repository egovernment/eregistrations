'use strict';

var generateDocumentPrev = require('../utils/generate-pdf')
  , normalizeOptions     = require('es5-ext/object/normalize-options')
  , setupTriggers        = require('../_setup-triggers')
  , ensureCallable       = require('es5-ext/object/valid-callable')
  , ensureString         = require('es5-ext/object/validate-stringifiable-value')
  , ensureObservableSet  = require('observable-set/valid-observable-set')
  , ensureObject         = require('es5-ext/object/valid-object');

/**
 *
 * @param {object} mainConfig
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
 * registerPromise   {function} - optional
 */

module.exports = function (mainConfig) {
	var onUpdate, entryCollection, config;

	config = normalizeOptions(ensureObject(mainConfig));
	entryCollection = ensureObservableSet(config.entryCollection);
	ensureString(config.fileKeyPath);
	if (config.insertsResolver != null) {
		ensureCallable(config.insertsResolver);
	}
	if (config.registerPromise != null) {
		ensureCallable(config.registerPromise);
	}
	ensureString(config.name);
	ensureString(config.templatePath);
	ensureString(config.dirpath);

	onUpdate = function (resolutionObject) {
		var fileObj, inserts, localConfig;

		fileObj = resolutionObject.resolveSKeyPath(
			config.fileKeyPath
		).value;
		localConfig = normalizeOptions(config, { fileObj: fileObj });
		if (config.insertsResolver) {
			inserts = config.insertsResolver(resolutionObject);
		} else {
			inserts = { context: resolutionObject };
		}
		localConfig.inserts = inserts;

		var promise = generateDocumentPrev(localConfig);
		if (config.registerPromise) {
			config.registerPromise(promise);
		} else {
			promise.done();
		}
	};

	setupTriggers({ trigger: entryCollection }, onUpdate);
};
