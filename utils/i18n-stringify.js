'use strict';

var keys = Object.keys, stringify = JSON.stringify

  , stringifyKey = function (key) { return stringify(key) + ': ' + stringify(this[key]); };

var compare = function (a, b) {
	return a.toLowerCase().localeCompare(b.toLowerCase()) || a.localeCompare(b);
};

module.exports = function (data) {
	return '{\n  ' + keys(data).sort(compare).map(stringifyKey, data).join(',\n  ') + '\n}\n';
};
