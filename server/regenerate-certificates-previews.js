'use strict';

var generateCertficatePrev = require('./utils/generate-certificate-pdf')
  , normalizeOptions       = require('es5-ext/object/normalize-options')
  , deferred               = require('deferred');

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
