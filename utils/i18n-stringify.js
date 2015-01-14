'use strict';

var keys = Object.keys, stringify = JSON.stringify

  , stringifyKey = function (key) { return stringify(key) + ': ' + stringify(this[key]); }
  , compare = function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()); };

module.exports = function (data) {
	return '{\n  ' + keys(data).sort(compare).map(stringifyKey, data).join(',\n  ') + '\n}\n';
};
