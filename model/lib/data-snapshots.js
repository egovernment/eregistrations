'use strict';

var memoize             = require('memoizee/plain')
  , validDb             = require('dbjs/valid-dbjs')
  , defineNaturalNumber = require('dbjs-ext/number/u-integer');

module.exports = memoize(function (db) {
	var NaturalNumber = defineNaturalNumber(validDb(db));

	return db.Object.extend('DataSnapshots', {
		totalSize: { type: NaturalNumber, nested: false }
	});

}, { normalizer: require('memoizee/normalizers/get-1')() });
