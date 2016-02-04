// Recomputes all computed indexes and reduced records

'use strict';

var flatten      = require('es5-ext/array/#/flatten')
  , ensureString = require('es5-ext/object/validate-stringifiable-value')
  , startsWith   = require('es5-ext/string/#/starts-with')
  , deferred     = require('deferred')
  , debug        = require('debug-ext')('setup', 4)
  , ensureDriver = require('dbjs-persistence/ensure-driver')
  , recompute    = require('dbjs-persistence/recompute');

module.exports = function (driver, slavePath) {
	var userStorage = ensureDriver(driver).getStorage('user')
	  , anyIdToStorage = require('../../utils/any-id-to-storage');

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

	debug.open("db-recompute");
	return recompute(driver, {
		slaveScriptPath: ensureString(slavePath),
		ids: (function () {
			var ids = [];
			return userStorage.search(null, function (id, data) {
				if (data.value === '7User#') ids.push(id);
			})(ids);
		}()),
		getData: function (userId) {
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
			}).invoke(flatten);
		}
	}).on('progress', function (event) {
		if (event.type === 'nextObject') debug.progress();
		if (event.type === 'nextPool') debug.progress('↻');
	})(function () {
		debug.progress();
		return driver.recalculateAllSizes();
	})(debug.close);
};
