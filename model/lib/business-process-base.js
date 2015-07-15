// Proto type for all BusinessProcess classes
// Temporary solution until one BusinessProcess definition remains

'use strict';

var memoize  = require('memoizee/plain')
  , ensureDb = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	return ensureDb(db).Object.extend('BusinessProcessBase');
}, { normalizer: require('memoizee/normalizers/get-1')() });
