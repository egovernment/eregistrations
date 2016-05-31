// Recomputes all computed indexes and reduced records

'use strict';

var aFrom              = require('es5-ext/array/from')
  , findIndex          = require('es5-ext/array/#/find-index')
  , flatten            = require('es5-ext/array/#/flatten')
  , ensureIterable     = require('es5-ext/iterable/validate-object')
  , ensureString       = require('es5-ext/object/validate-stringifiable-value')
  , startsWith         = require('es5-ext/string/#/starts-with')
  , Map                = require('es6-map')
  , deferred           = require('deferred')
  , debug              = require('debug-ext')('setup', 4)
  , ensureDriver       = require('dbjs-persistence/ensure-driver')
  , recompute          = require('dbjs-persistence/recompute')
  , isOfficialRoleName = require('../../../utils/is-official-role-name');

module.exports = function (driver, slavePath/*, options*/) {
	var userStorage = ensureDriver(driver).getStorage('user')
	  , anyIdToStorage = require('../../utils/any-id-to-storage')
	  , businessProcessStorages = require('../../utils/business-process-storages')
	  , options = Object(arguments[2]), userManagers = new Map()
	  , officialPropertyNames;

	if (options.officialPropertyNames) {
		officialPropertyNames = aFrom(ensureIterable(officialPropertyNames));
	} else {
		officialPropertyNames = ['firstName', 'lastName'];
	}

	var getBusinessProcessData = function (bpId) {
		return anyIdToStorage(bpId)(function (storage) {
			if (!storage) return [];
			return storage.getObject(bpId)(function (bpData) {
				var id = bpId + '/derivedBusinessProcess';
				return deferred.map(bpData, function (data) {
					if (data.id !== id) return data;
					if (data.data.value[0] !== '7') return data;
					return getBusinessProcessData(data.data.value.slice(1))(function (result) {
						result.push(data);
						return result;
					});
				});
			});
		});
	};

	var getUserData = function (userId) {
		return userStorage.getObject(userId)(function (userData) {
			var prefix = userId + '/initialBusinessProcesses*7';
			return deferred.map(userData, function (data) {
				if (!startsWith.call(data.id, prefix)) return data;
				if (data.data.value !== '11') return data;
				return getBusinessProcessData(data.id.slice(prefix.length))(function (result) {
					result.push(data);
					return result;
				});
			});
		});
	};

	return deferred(
		userStorage.search({ keyPath: 'manager' }, function (id, data) {
			var managerId;
			if (data.value[0] !== '7') return;
			managerId = data.value.slice(1);
			if (!userManagers.has(managerId)) userManagers.set(managerId, []);
			userManagers.get(managerId).push(id.split('/', 1)[0]);
		}),
		businessProcessStorages.map(function (storage) {
			var businessProcessManagers = new Map();
			return storage.search({ keyPath: 'manager' }, function (id, data) {
				var managerId;
				if (data.value[0] !== '7') return;
				managerId = data.value.slice(1);
				businessProcessManagers.set(id.split('/', 1)[0], managerId);
			})(function () {
				return userStorage.search({ keyPath: 'initialBusinessProcesses' }, function (id, data) {
					var managerId;
					if (data.value !== '11') return;
					managerId = businessProcessManagers.get(id.slice(id.lastIndexOf('*') + 2));
					if (!managerId) return;
					if (!userManagers.has(managerId)) userManagers.set(managerId, []);
					userManagers.get(managerId).push(id.split('/', 1)[0]);
				});
			});
		})
	)(function () {

		var getManagerData = function (managerId) {
			if (!userManagers.has(managerId)) return [];
			return deferred.map(userManagers.get(managerId), getUserData);
		};

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
			ids: userStorage.getAllObjectIds(),
			getData: function (userId) {
				return deferred(
					getUserData(userId),
					getManagerData(userId)
				).invoke(flatten);
			},
			initialData: initialData
		}).on('progress', function (event) {
			if (event.type === 'nextObject') debug.progress();
			if (event.type === 'nextPool') debug.progress('↻');
		});
	})(function () {
		debug.progress('|');
		return driver.recalculateAllSizes();
	})(function (stats) {
		debug.progress(' masters: ' + stats.mastersCount + ', records: ' + stats.recordCount +
			' maxRecords: ' + stats.maxRecordsPerMasterCount);
		debug.close();
	});
};
