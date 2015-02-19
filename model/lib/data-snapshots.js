'use strict';

var memoize             = require('memoizee/plain')
  , validDb             = require('dbjs/valid-dbjs')
  , defineNaturalNumber = require('dbjs-ext/number/integer/u-integer');

module.exports = memoize(function (db) {
	var NaturalNumber = defineNaturalNumber(validDb(db));

	var DataSnapshots = db.Object.extend('DataSnapshots', {
		totalSize: { type: NaturalNumber, multiple: false }
	});

	DataSnapshots.prototype._descriptorPrototype_.setProperties({
		type: db.Object,
		multiple: true
	});
	return DataSnapshots;
}, { normalizer: require('memoizee/normalizers/get-1')() });
