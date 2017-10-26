'use strict';

var ObservableSet = require('observable-set')
  , ObservableValue = require('observable-value')
  , jsonToObservables;

module.exports = jsonToObservables = function (source) {
	var target = {};
	if (Array.isArray(source)) {
		target = new ObservableSet();
		source.forEach(function (sourceItem) {
			target.add(jsonToObservables(sourceItem));
		});
	} else {
		Object.keys(source).forEach(function (key) {
			if (typeof source[key] === "object") {
				target[key] = target["_" + key] = jsonToObservables(source[key]);
			} else {
				target[key] = target["_" + key] = new ObservableValue(source[key]);
			}
		});
	}

	return target;
};
