'use strict';

var ObservableArray = require('observable-array');

module.exports = function (t, a) {
	var arr, value;
	a(t(['foo', 'bar'], 1), 'bar');
	a(t(['foo', 'bar'], 100), undefined);
	arr = new ObservableArray('foo', 'bar');
	value = t(arr, 1);
	a(value.value, 'bar');
	arr.set(1, 'elo');
	a(value.value, 'elo');
	arr.pop();
	a(value.value, undefined);
};
