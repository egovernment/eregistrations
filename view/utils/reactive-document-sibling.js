// Returns observable value for nearest (to provided target item) element in provided collection
// Two functions: `next` and `previous` are exposed by this module

'use strict';

var some              = require('es6-set/ext/some')
  , ObservableValue   = require('observable-value')
  , isObservableValue = require('observable-value/is-observable-value');

var getObservable = function (value, uniqueKey) {
	var observable = new ObservableValue(), getUpdate = this, update, collection;
	var onCollectionChange = function () { observable.value = update(collection, uniqueKey); };
	var onValueChange = function (value) {
		if (collection) {
			if (collection.off) collection.off('change', onCollectionChange);
			collection = null;
		}
		if (!value) {
			observable.value = null;
			return;
		}
		collection = value;
		update = getUpdate(collection, uniqueKey);
		if (collection.on) collection.on('change', onCollectionChange);
		onCollectionChange();
	};
	if (isObservableValue(value)) {
		value.on('change', function (event) { onValueChange(event.newValue); });
		onValueChange(value.value);
	} else {
		onValueChange(value);
	}
	return observable;
};

exports.next = getObservable.bind(function (collection, uniqueKey) {
	var someMethod = (typeof collection.some === 'function') ? collection.some : some;
	return function () {
		var seen, nuValue = null;
		someMethod.call(collection, function (item) {
			if (seen) {
				nuValue = item;
				return true;
			}
			if (item.uniqueKey === uniqueKey) {
				seen = true;
				return;
			}
		});
		return nuValue;
	};
});

exports.previous = getObservable.bind(function (collection, uniqueKey) {
	var someMethod = (typeof collection.some === 'function') ? collection.some : some;
	return function () {
		var previous = null, nuValue = null;
		someMethod.call(collection, function (item) {
			if (item.uniqueKey === uniqueKey) {
				nuValue = previous;
				return true;
			}
			previous = item;
		});
		return nuValue;
	};
});
