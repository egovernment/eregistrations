'use strict';

var keys = Object.keys, stringify = JSON.stringify

  , stringifyKey = function (key) { return stringify(key) + ': ' + stringify(this[key]); };

module.exports = function (data) {
	return '{\n  ' + keys(data).sort().map(stringifyKey, data).join(',\n  ') + '\n}\n';
};
