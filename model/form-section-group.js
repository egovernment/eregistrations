'use strict';

var memoize = require('memoizee/plain')
  , validDb = require('dbjs/valid-dbjs');

module.exports = memoize(function (db) {
	return validDb(db).FormSectionBase.extend('FormSectionGroup', {
		sections: { type: db.FormSectionBase, multiple: true },
		isApplicable: { type: db.Boolean, value: function () {
			return this.sections.some(function (section) {
				return section.isApplicable;
			});
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
