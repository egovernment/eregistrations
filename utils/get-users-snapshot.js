'use strict';

var memoize       = require('memoizee/plain')
  , ObservableSet = require('observable-set')
  , db            = require('mano').db;

var resolveUsers = function (value) {
	if (!value) return [];
	return value.split(',').map(function (id) {
		return db.objects.unserialize(id, db.User);
	});
};
module.exports = memoize(function (observable) {
	var set = new ObservableSet(resolveUsers(observable.value));
	observable.on('change', function (event) {
		set._postponed_ += 1;
		set.clear();
		resolveUsers(event.newValue).forEach(set.add, set);
		set._postponed_ -= 1;
	});
	return set;
}, { normalizer: function (args) { return args[0].dbId; } });
