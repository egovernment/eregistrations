// Returns observable for given array index
// If plain (non observable) array is passed then value is returned directly

'use strict';

var ensureArray         = require('es5-ext/array/valid-array')
  , ObservableValue     = require('observable-value')
  , isObservableArray   = require('observable-array/is-observable-array')
  , ensureNaturalNumber = require('es5-ext/object/ensure-natural-number-value');

module.exports = function (array, index) {
	var observable;
	ensureArray(array);
	index = ensureNaturalNumber(index);
	if (!isObservableArray(array)) return array[index];
	observable = new ObservableValue(array[index]);
	array.on('change', function () { observable.value = array[index]; });
	return observable;
};
