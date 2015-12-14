'use strict';

var find     = require('es5-ext/array/#/find')
  , endsWith = require('es5-ext/string/#/ends-with');

module.exports = function (data, key) {
	return data[find.call(Object.keys(data), function (k) {
		return endsWith.call(k, '/' + key);
	})];
};
