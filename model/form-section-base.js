'use strict';

var memoize = require('memoizee/plain')
  , validDb = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	return validDb(db).Object.extend('FormSectionBase', {
		label: { type: db.StringLine },
		isApplicable: { type: db.Boolean, value: function () {
			return true;
		} },
		resolventProperty: { type: db.StringLine }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
