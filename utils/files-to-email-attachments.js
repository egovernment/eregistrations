'use strict';

var memoize        = require('memoizee/plain')
  , ensureDatabase = require('dbjs/valid-dbjs')
  , defineFile     = require('dbjs-ext/object/file')
  , toArray        = require('es5-ext/array/to-array');

module.exports = memoize(function (db) {
	var File = defineFile(ensureDatabase(db));

	return function (/*file, ..., fileN*/) {
		return toArray(arguments).filter(function (file) {
			File.validate(file);

			return Boolean(file.name && file.path);
		}).map(function (file) {
			return { filename: file.name, path: file.path };
		});
	};

}, { normalizer: require('memoizee/normalizers/get-1')() });
