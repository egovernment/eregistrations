// Returns observable set of objects for given constraints

'use strict';

var memoize             = require('memoizee')
  , resolveFilter       = require('dbjs-persistence/lib/resolve-filter')
  , resolveDirectFilter = require('dbjs-persistence/lib/resolve-direct-filter')
  , ObservableSet       = require('observable-set/primitive')
  , dbDriver            = require('mano').dbDriver;

module.exports = memoize(function (recordType, keyPath, value) {
	var set = new ObservableSet();
	dbDriver.on(recordType + ':' + keyPath || '&', function (event) {
		if (resolveFilter(value, event.data.value)) set.add(event.ownerId);
		else set.delete(event.ownerId);
	});
	if (recordType === 'computed') {
		return dbDriver.searchComputed(keyPath, function (ownerId, data) {
			if (resolveFilter(value, data.value)) set.add(ownerId);
		})(set);
	}
	return dbDriver.searchDirect(keyPath, function (id, data) {
		var index;
		if (!resolveDirectFilter(value, data.value, id)) return;
		index = id.indexOf('/');
		set.add((index === -1) ? id : id.slice(0, index));
	})(set);
}, { primitive: true });
