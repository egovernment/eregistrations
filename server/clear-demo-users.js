// Server process service
// Once per day removes stale (not acceessed for more than one week)
// demo user instances with all corresponding business processes that were created

'use strict';

var debug    = require('debug-ext')('clear-demo-users')
  , deferred = require('deferred')
  , now      = require('microtime-x')
  , dbDriver = require('mano').dbDriver

  , matchObjectId = RegExp.prototype.test.bind(/\*7([0-9][a-z0-9]+)$/)
  , day = 24 * 60 * 60 * 1000; // in milliseconds

var deleteDerived = function (businessProcessId) {
	return dbDriver.getDirect(businessProcessId + '/derivedBusinessProcess')(function (data) {
		var derivedBusinessProcessId;
		if (!data) return;
		if (data.value[0] !== '7') return;
		derivedBusinessProcessId = data.value.slice(1);
		return deleteDerived(derivedBusinessProcessId)(function () {
			return dbDriver.deleteDirectObject(derivedBusinessProcessId);
		});
	});
};

var clearDemoUsers = function () {
	var promises = [], lastWeek = now() - 7 * day * 1000; // in microseconds

	debug('deleting demo users inactive since %s', lastWeek);

	dbDriver.searchDirect('isDemo', function (id, data) {
		var ownerId;
		if (data.value !== '11') return;
		ownerId = id.split('/', 1)[0];
		promises.push(dbDriver.getDirect(ownerId + '/demoLastAccessed')(function (data) {
			if (data && (data.stamp > lastWeek)) return;
			return dbDriver.getDirectObjectKeyPath(ownerId + '/initialBusinessProcesses')
				.map(function (event) {
					var match, businessProcessId;
					if (event.data.value !== '11') return;
					match = matchObjectId(event.id);
					if (!match) return;
					businessProcessId = match[1];
					return deleteDerived(businessProcessId)(function () {
						return dbDriver.deleteDirectObject(businessProcessId);
					});
				})(function () { return dbDriver.deleteDirectObject(ownerId); });
		}));
	})(function () { return deferred.map(promises); }).done();
};

clearDemoUsers();
setInterval(clearDemoUsers, day);
