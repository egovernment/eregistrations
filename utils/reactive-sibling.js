// Returns observable value for nearest (to provided target item) element in provided collection
// Two functions: `next` and `previous` are exposed by this module

'use strict';

var some                = require('es6-set/ext/some')
  , ObservableValue     = require('observable-value')
  , ensureObservableSet = require('observable-set/valid-observable-set');

var getObservable = function (collection, target) {
	var observable, update;
	ensureObservableSet(collection);
	update = this(collection, target);
	observable = new ObservableValue(update());
	collection.on('change', function () { observable.value = update(); });
	return observable;
};

exports.next = getObservable.bind(function (collection, target) {
	var someMethod = (typeof collection.some === 'function') ? collection.some : some;
	return function () {
		var seen, nuValue = null;
		someMethod.call(collection, function (item) {
			if (seen) {
				nuValue = item;
				return true;
			}
			if (item === target) {
				seen = true;
				return;
			}
		});
		return nuValue;
	};
});

exports.previous = getObservable.bind(function (collection, target) {
	var someMethod = (typeof collection.some === 'function') ? collection.some : some;
	return function () {
		var previous = null, nuValue = null;
		someMethod.call(collection, function (item) {
			if (item === target) {
				nuValue = previous;
				return true;
			}
			previous = item;
		});
		return nuValue;
	};
});
