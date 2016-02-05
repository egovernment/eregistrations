'use strict';

var generateCertficatePrev = require('./utils/generate-certificate-pdf')
  , normalizeOptions       = require('es5-ext/object/normalize-options')
  , deferred               = require('deferred')
  , setupTriggers          = require('./_setup-triggers');

/**
 *
 * @param {object} config
 * entryCollection   {set}    - the collection of businessProcesses filtered by entry condition
 *                              (which objects are to be taken into account)
 * nameSuffix        {string} - suffix of preview file name i.e '-my-cert.pdf',
 * previewFilePath   {string} - path to certificates preview file relative to bp
 *                              i.e. 'certificates/map/my-cert/previewFile',
 * uploadsPath       {string} - absolute path to project's uploads folder
 * templatePath      {string} - absolute path to html template of the preview
 */

module.exports = function (config) {
	var onUpdate, entryCollection;
	entryCollection = config.entryCollection;

	onUpdate = function (bp) {
		var resolutionObject = bp;

		return deferred(
			(function () {
				var localConfig = normalizeOptions(config, { resolutionObject: resolutionObject });
				return generateCertficatePrev(localConfig);
			}())
		).done();
	};

	setupTriggers({ trigger: entryCollection }, onUpdate);
};
