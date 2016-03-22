'use strict';

var memoize  = require('memoizee/plain')
  , ensureDb = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	return ensureDb(db).Object.newNamed('globalPrimitives');
}, { normalizer: require('memoizee/normalizers/get-1')() });
