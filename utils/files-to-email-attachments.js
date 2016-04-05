'use strict';

var memoize        = require('memoizee/plain')
  , ensureDatabase = require('dbjs/valid-dbjs')
  , defineFile     = require('dbjs-ext/object/file')
  , ensureArray    = require('es5-ext/array/valid-array');

module.exports = memoize(function (db) {
	var File = defineFile(ensureDatabase(db));

	return function (filesList) {
		return ensureArray(filesList).filter(function (file) {
			File.validate(file);

			return Boolean(file.name && file.path);
		}).map(function (file) {
			return { filename: file.name, path: file.path };
		});
	};

}, { normalizer: require('memoizee/normalizers/get-1')() });
