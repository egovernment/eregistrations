// For given data map returns sorted array

'use strict';

var ensureCallable = require('es5-ext/object/valid-callable')
  , ensureMap      = require('es6-map/valid-map');

module.exports = function (data, compare) {
	(ensureMap(data) && ensureCallable(compare));
	var result = [];
	data.forEach(function (itemData) { result.push(itemData); });
	return result.sort(compare);
};
