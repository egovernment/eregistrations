'use strict';

var find     = require('es5-ext/object/find')
  , endsWith = require('es5-ext/string/#/ends-with');

module.exports = function (data, key) {
	return find(data, function (d, k) {
		return endsWith.call(k, '/' + key);
	});
};
