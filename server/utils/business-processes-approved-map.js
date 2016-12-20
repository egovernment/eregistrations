'use strict';

var ComputedEmitter              = require('./computed-emitter')
  , dbDriver                     = require('mano').dbDriver
  , forEach                      = require('es5-ext/object/for-each')
  , isBusinessProcessStorageName = RegExp.prototype.test.bind(/^businessProcess[A-Z]/);

module.exports = (function () {
	return dbDriver.getStorages()(function (storages) {
		var bpStorages = [];
		forEach(storages, function (storage, name) {
			if (!isBusinessProcessStorageName(name)) return;
			bpStorages.push(storage);
		});
		return new ComputedEmitter(bpStorages, 'isApproved', { type: 'direct' });
	});
}());
