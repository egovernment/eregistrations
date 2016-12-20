'use strict';

var genId         = require('time-uuid')
  , driver        = require('mano').dbDriver
  , ensureStorage = require('dbjs-persistence/ensure-storage')
  , capitalize    = require('es5-ext/string/#/capitalize')
  , deferred      = require('deferred')
  , userStorage   = driver.getStorage('user');

module.exports = function (businessProcessStorage) {
	var recordsPath = this.userId + '/initialBusinessProcesses';
	ensureStorage(businessProcessStorage);

	return userStorage.getObjectKeyPath(recordsPath)(function (records) {
		var businessProcessId;
		return deferred.some(records, function (record) {
			var queriedBusinessProcessId;
			if (record.data.value !== '11') return;
			queriedBusinessProcessId = record.id.slice(recordsPath.length + 2);
			if (!queriedBusinessProcessId) return;
			return businessProcessStorage.get(queriedBusinessProcessId)(function (data) {
				if (!data || !data.value) return;
				businessProcessId = queriedBusinessProcessId;
				return true;
			});
		})(function () {
			var userRecords = [], businessProcessRecords = [];
			if (!businessProcessId) {
				businessProcessId = genId();
				userRecords.push({
					id: this.userId + '/initialBusinessProcesses*7' + businessProcessId,
					data: { value: '11' }
				});
				businessProcessRecords.push({
					id: businessProcessId,
					data: { value: '7' + capitalize.call(businessProcessStorage.name) + '#' }
				}, {
					id: businessProcessId + '/isDemo',
					data: { value: '11' }
				});
			}
			userRecords.push({
				id: this.userId + '/currentBusinessProcess',
				data: { value: '7' + businessProcessId }
			});
			return deferred(
				businessProcessStorage.storeMany(businessProcessRecords),
				userStorage.storeMany(userRecords)
			);
		}.bind(this));
	}.bind(this));
};
