'use strict';

var memoize = require('memoizee/plain')
  , validDb = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	return validDb(db).FormSectionBase.extend('FormSection', {
		propertyNames: { type: db.StringLine, multiple: true }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
