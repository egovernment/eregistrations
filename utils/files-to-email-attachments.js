'use strict';

var ensureDbjsObject = require('dbjs/valid-dbjs-object')
  , toArray          = require('es5-ext/array/to-array');

module.exports = function (/*file, ..., fileN*/) {
	return toArray(arguments).filter(function (file) {
		ensureDbjsObject(file);

		return Boolean(file.name && file.path);
	}).map(function (file) {
		return { filename: file.name, path: file.path };
	});
};
