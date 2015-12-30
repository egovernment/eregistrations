// Server process service
// Once per day removes stale (not acceessed for more than one week)
// demo user instances with all corresponding business processes that were created

'use strict';

var debug    = require('debug-ext')('clear-demo-users')
  , deferred = require('deferred')
  , now      = require('microtime-x')
  , dbDriver = require('mano').dbDriver

  , objectIdRe = /\*7([0-9][a-z0-9]+)$/
  , day = 24 * 60 * 60 * 1000; // in milliseconds

var getDerived = function (businessProcessId, ids) {
	return dbDriver.get(businessProcessId + '/derivedBusinessProcess')(function (data) {
		var derivedBusinessProcessId;
		if (!data) return;
		if (data.value[0] !== '7') return;
		derivedBusinessProcessId = data.value.slice(1);
		ids.push(derivedBusinessProcessId);
		return getDerived(derivedBusinessProcessId, ids);
	});
};

var clearDemoUsers = function () {
	var promises = [], ids = [], lastWeek = now() - 7 * day * 1000; // in microseconds

	debug('deleting demo users inactive since %s', lastWeek);

	dbDriver.search('isDemo', function (id, data) {
		var ownerId;
		if (data.value !== '11') return;
		ownerId = id.split('/', 1)[0];
		promises.push(dbDriver.get(ownerId + '/demoLastAccessed')(function (data) {
			if (!data || (data.stamp > lastWeek)) return;
			ids.push(ownerId);
			return dbDriver.getObjectKeyPath(ownerId + '/initialBusinessProcesses')
				.map(function (event) {
					var match, businessProcessId;
					if (event.data.value !== '11') return;
					match = event.id.match(objectIdRe);
					if (!match) return;
					businessProcessId = match[1];
					ids.push(businessProcessId);
					return getDerived(businessProcessId, ids);
				});
		}));
	})(function () { return deferred.map(promises); })(function () {
		return dbDriver.deleteManyObjects(ids);
	}).done();
};

clearDemoUsers();
setInterval(clearDemoUsers, day);
