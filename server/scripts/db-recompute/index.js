// Recomputes all computed indexes and reduced records

'use strict';

var aFrom              = require('es5-ext/array/from')
  , findIndex          = require('es5-ext/array/#/find-index')
  , flatten            = require('es5-ext/array/#/flatten')
  , ensureIterable     = require('es5-ext/iterable/validate-object')
  , ensureString       = require('es5-ext/object/validate-stringifiable-value')
  , Map                = require('es6-map')
  , Set                = require('es6-set')
  , deferred           = require('deferred')
  , debug              = require('debug-ext')('setup', 4)
  , ensureDriver       = require('dbjs-persistence/ensure-driver')
  , recompute          = require('dbjs-persistence/recompute')
  , isOfficialRoleName = require('../../../utils/is-official-role-name');

module.exports = function (driver, slavePath/*, options*/) {
	var userStorage = ensureDriver(driver).getStorage('user')
	  , businessProcessStorages = require('../../utils/business-process-storages')
	  , takenByParent = new Set(), depsMap = new Map(), storageMap = new Map()
	  , options = Object(arguments[2])
	  , officialPropertyNames;

	if (options.officialPropertyNames) {
		officialPropertyNames = aFrom(ensureIterable(officialPropertyNames));
	} else {
		officialPropertyNames = ['firstName', 'lastName'];
	}

	// Gather basic data of all official accounts to be present in memory of each process
	var initialData = userStorage.search(function (id, data) {
		var userId = id.split('/', 1)[0];
		return userStorage.getObjectKeyPath(userId + '/roles')(function (records) {
			var isOfficial = records.some(function (record) {
				var roleName;
				if (record.data.value !== '11') return;
				roleName = record.id.slice((userId + '/roles*').length);
				if (isOfficialRoleName(roleName)) return true;
			});
			if (!isOfficial) return;
			return userStorage.getObject(userId, { keyPaths: officialPropertyNames });
		});
	})(function (data) {
		data = flatten.call(data).filter(Boolean);
		if (!options.initialData) return data;
		return deferred(options.initialData)(function (optionalData) {
			return data.concat(flatten.call(optionalData).filter(Boolean))
				.filter(function (record, index, all) {
					// Filter duplicate records
					return findIndex.call(all, function (item) { return record.id === item.id; }) === index;
				});
		});
	});

	debug.open("db-recompute");
	return recompute(driver, {
		slaveScriptPath: ensureString(slavePath),
		ids: userStorage.getAllObjectIds()(function (userIds) {
			return deferred.map(userIds, function (userId) {
				var deps = {};
				storageMap.set(userId, userStorage);
				depsMap.set(userId, deps);
				return deferred(
					userStorage.get(userId + '/currentBusinessProcess')(function (data) {
						if (!data || (data.value[0] !== '7')) return;
						takenByParent.add(deps.businessProcess = data.value.slice(1));
					}),
					userStorage.get(userId + '/currentlyManagedUser')(function (data) {
						if (!data || (data.value[0] !== '7')) return;
						takenByParent.add(deps.user = data.value.slice(1));
					})
				);
			})(function () {
				userIds = userIds.filter(function (userId) { return !takenByParent.has(userId); });
				return businessProcessStorages.map(function (storage) {
					return storage.getAllObjectIds()(function (ids) {
						return deferred.map(ids, function (id) {
							var deps = {};
							depsMap.set(id, deps);
							return storage.get(id + '/derivedBusinessProcess')(function (data) {
								if (!data || (data.value[0] !== '7')) return;
								takenByParent.add(deps.businessProcess = data.value.slice(1));
							});
						})(function () {
							return ids.filter(function (id) {
								storageMap.set(id, storage);
								return !takenByParent.has(id);
							});
						});
					});
				})(function (ids) { return userIds.concat(flatten.call(ids)); });
			});
		}),
		getData: function self(objectId) {
			var storage = storageMap.get(objectId), deps;
			if (!storage) throw new Error("Cannot resolve deps map");
			deps = depsMap.get(objectId);
			if (!deps) throw new Error("Cannot resolve deps map");
			return deferred(
				storage.getObject(objectId),
				deps.user && self(deps.user),
				deps.businessProcess && self(deps.businessProcess)
			).invoke('filter', Boolean).invoke(flatten);
		},
		initialData: initialData
	}).on('progress', function (event) {
		if (event.type === 'nextObject') debug.progress();
		if (event.type === 'nextPool') debug.progress('↻');
	})(function (stats) {
		debug.progress('|');
		return driver.recalculateAllSizes()(stats);
	})(function (stats) {
		debug.progress(' records: ' + stats.recordsCount + ', masters: ' + stats.mastersCount +
			', maxMasterRecords: ' + stats.maxRecordsPerMasterCount);
		debug.close();
	});
};
