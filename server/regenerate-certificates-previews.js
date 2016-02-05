'use strict';

var generateCertficatePrev = require('./utils/generate-certificate-pdf')
  , normalizeOptions       = require('es5-ext/object/normalize-options')
  , deferred               = require('deferred');

/**
 *
 * @param {object} config
 * entryCollection   {set}    - the collection of businessProcesses filtered by entry condition
 *                              (which bps are to be taken into account)
 * updateTriggerPath {string} - relative to bp
 *                              i.e. 'certificates/map/myCert/dataForm/lastEditStamp',
 * nameSuffix        {string} - suffix of preview file name i.e '-my-cert.pdf',
 * previewFilePath   {string} - path to certificates preview file relative to bp
 *                              i.e. 'certificates/map/my-cert/previewFile',
 * uploadsPath       {string} - absolute path to project's uploads folder
 * templatePath      {string} - absolute path to html template of the preview
 */

module.exports = function (config) {
	var onUpdate, register, unregister, entryCollection, updateTriggerPath;
	entryCollection   = config.entryCollection;
	updateTriggerPath = config.updateTriggerPath;

	onUpdate = function () {
		var bp = this.object.master, value = this.value;
		return deferred(
			(function () {
				var localConfig = normalizeOptions(config, { businessProcess: bp });
				if (bp.resolveSKeyPath(localConfig.previewFilePath).value._path.lastModified < value) {
					return generateCertficatePrev(localConfig);
				}
			}())
		).done();
	};

	register = function (bp) {
		var observable = bp.resolveSKeyPath(updateTriggerPath).observable;
		observable.on('change', onUpdate);
		onUpdate.call(observable);
	};

	unregister = function (bp) {
		bp.resolveSKeyPath(updateTriggerPath).observable.off('change', onUpdate);
	};
	entryCollection.forEach(register);

	entryCollection.on('change', function (event) {
		var bp = event.value;

		if (event.type === 'add') {
			register(bp);
		} else if (event.type === 'delete') {
			unregister(bp);
		} else if (event.type === 'batch') {
			if (event.added) {
				event.added.forEach(register);
			}
			if (event.deleted) {
				event.deleted.forEach(unregister);
			}
		}
	});
};
