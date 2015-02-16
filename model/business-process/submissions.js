'use strict';

var memoize     = require('memoizee/plain')
  , validDbType = require('dbjs/valid-dbjs-type');

module.exports = memoize(function (Target) {
	var db;
	validDbType(Target);
	db = Target.database;
	Target.prototype.defineProperties({
		submissions: {
			type: db.Object,
			nested: true
		}
	});

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
