// Server process service
// Once per day removes stale (not acceessed for more than one week)
// demo user instances with all corresponding business processes that were created

'use strict';

var forEach    = require('es5-ext/object/for-each')
  , endsWith   = require('es5-ext/string/#/ends-with')
  , startsWith = require('es5-ext/string/#/ends-with')
  , debug      = require('debug-ext')('clear-demo-users')
  , deferred   = require('deferred')
  , now        = require('microtime-x')
  , dbDriver   = require('mano').dbDriver

  , keys = Object.keys
  , userStorage = dbDriver.getStorage('user')
  , objectIdRe = /\*7([0-9][a-z0-9]+)$/
  , day = 24 * 60 * 60 * 1000; // in milliseconds

var resolveStorages = function () {
	return dbDriver.getStorages(function (storages) {
		var result = [];
		forEach(function (storage, name) {
			if (!startsWith.call(name, 'businessProcess')) return;
			if (endsWith.call(name, 'Update')) return;
			result.push({ storage: name, updateStorage: storages[name + 'Update'] });
		});
		return result;
	});
};

var getDerived = function (baseStorage, updateStorage, businessProcessId, ids) {
	return baseStorage.get(businessProcessId + '/derivedBusinessProcess')(function (data) {
		var derivedBusinessProcessId;
		if (!data) return;
		if (data.value[0] !== '7') return;
		derivedBusinessProcessId = data.value.slice(1);
		if (!ids[updateStorage.name]) ids[updateStorage.name] = [];
		ids[updateStorage.name].push(businessProcessId);
		ids.push(derivedBusinessProcessId);
		return getDerived(updateStorage, updateStorage, derivedBusinessProcessId, ids);
	});
};

var clearDemoUsers = function () {
	var ids = {}, lastWeek = now() - 7 * day * 1000; // in microseconds

	debug('deleting demo users inactive since %s', lastWeek);

	resolveStorages(function (bpStorages) {
		return userStorage.search({ keyPath: 'isDemo' }, function (id, data) {
			var ownerId;
			if (data.value !== '11') return;
			ownerId = id.split('/', 1)[0];
			return userStorage.get(ownerId + '/demoLastAccessed')(function (data) {
				if (!data || (data.stamp > lastWeek)) return;
				ids.push(ownerId);
				return userStorage.getObjectKeyPath(ownerId + '/initialBusinessProcesses')
					.map(function (event) {
						var match, businessProcessId;
						if (event.data.value !== '11') return;
						match = event.id.match(objectIdRe);
						if (!match) return;
						businessProcessId = match[1];
						return deferred.some(bpStorages, function (meta) {
							return meta.storage.get(businessProcessId)(function (data) {
								if (!data) return;
								if (!ids[meta.storage.name]) ids[meta.storage.name] = [];
								ids[meta.storage.name].push(businessProcessId);
								if (!meta.updateStorage) return true;
								return getDerived(meta.storage, meta.updateStorage, businessProcessId, ids)(true);
							});
						});
					});
			});
		})(function () {
			return deferred.map(keys(ids), function (name) {
				return dbDriver.getStorage(name).deleteManyObjects(ids[name]);
			});
		});
	}).done();
};

clearDemoUsers();
setInterval(clearDemoUsers, day);
