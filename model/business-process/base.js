"use strict";

var memoize    = require('memoizee/plain')
  , validDb    = require('dbjs/valid-dbjs');

module.exports = memoize(function (db/*, options*/) {
	validDb(db);

	return db.Object.extend('BusinessProcess');
}, { normalizer: require('memoizee/normalizers/get-1')() });
