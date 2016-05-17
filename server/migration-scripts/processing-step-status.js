// One time migration script to address proposed changes in
// (1) of https://github.com/egovernment/eregistrations/issues/1282

'use strict';

var flatten  = require('es5-ext/array/#/flatten')
  , deferred = require('deferred')

  , isStepStatus = RegExp.prototype.test.bind(/\/processingSteps\/map\/[a-zA-Z0-9\/]+\/status$/)
  , keys = Object.keys;

module.exports = function () {
	return require('../utils/business-process-storages')(function (storages) {
		return deferred.map(keys(storages), function (storageName) {
			var storage = storages[storageName];
			return storage.search(function (id, data) {
				if (isStepStatus(id)) return { id: id, data: data };
			})(function (records) {
				return storage.storeMany(flatten.call(records.map(function (record) {
					return [
						{ id: record.id, data: { value: '' } },
						{ id: record.id.replace(/status$/, 'officialStatus'),
							data: { value: record.data.value } }
					];
				})));
			});
		});
	});
};
