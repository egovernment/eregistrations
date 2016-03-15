'use strict';

var memoize     = require('memoizee/plain')
  , validDbType = require('dbjs/valid-dbjs-type');

module.exports = memoize(function (Target) {
	var db = validDbType(Target).database;

	Target.prototype.define('getTranslations', {
		type: db.Function,
		value: function (options) {
			return {};
		}
	});

	return Target;
}, { normalizer: require('memoizee/normalizers/get-1')() });
