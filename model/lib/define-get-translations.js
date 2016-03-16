'use strict';

var memoize        = require('memoizee/plain')
  , ensureDbObject = require('dbjs/valid-dbjs-object');

module.exports = memoize(function (target) {
	var db = ensureDbObject(target).database;

	target.define('getTranslations', {
		type: db.Function,
		value: function (options) {
			return {};
		}
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
