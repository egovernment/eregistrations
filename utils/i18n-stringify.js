'use strict';

var keys = Object.keys, stringify = JSON.stringify

  , stringifyKey = function (key) { return stringify(key) + ': ' + stringify(this[key]); };

var fixedStrCompare = function (a, b) {
	if (a === b) return 0;
	return a > b ? 1 : -1;
};

var compare = function (a, b) {
	return fixedStrCompare(a.toLowerCase(), b.toLowerCase()) || fixedStrCompare(a, b);
};

module.exports = function (data) {
	return '{\n  ' + keys(data).sort(compare).map(stringifyKey, data).join(',\n  ') + '\n}\n';
};
