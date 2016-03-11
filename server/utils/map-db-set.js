// Maps resolved values to some other values
// e.g. out of [bpId, bpId, bpI], resolves [userId, userId, userId]

'use strict';

var aFrom               = require('es5-ext/array/from')
  , ensureCallable      = require('es5-ext/object/valid-callable')
  , deferred            = require('deferred')
  , Map                 = require('es6-map')
  , ensureObservableSet = require('observable-set/valid-observable-set')
  , ObservableSet       = require('observable-set/primitive');

module.exports = function (set, cb/*, thisArg*/) {
	var result, map;
	ensureObservableSet(set);
	ensureCallable(cb);

	result = new ObservableSet();
	map = new Map();
	var onAdd = function (value) {
		return deferred(cb(value))(function (to) {
			if (!set.has(value) || (to == null)) return;
			map.set(value, to);
			result.add(to);
		});
	};
	var onDelete = function (value) {
		result.delete(map.get(value));
		map.delete(value);
	};
	result.promise = deferred(set.promise, deferred.map(aFrom(set), onAdd));
	set.on('change', function (event) {
		if (event.type === 'add') {
			onAdd(event.value).done();
		} else if (event.type === 'delete') {
			onDelete(event.value);
		} else if (event.type === 'batch') {
			if (event.added) deferred.map(aFrom(event.added), onAdd).done();
			if (event.deleted) event.delete.forEach(onDelete);
		} else {
			console.log(event);
			throw new Error("Unrecognized event");
		}
	});
	return result;
};
