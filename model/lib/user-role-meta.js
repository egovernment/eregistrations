'use strict';

var memoize = require('memoizee/plain');

module.exports = memoize(function (db) {
	return db.Object.extend('UserRoleMeta', {
		canBeDestroyed: { type: db.Boolean, value: true },
		validateDestroy: { type: db.Function, value: function (ignore) {
			if (!this.canBeDestroyed) {
				throw new Error('Cannot destroy user, role restriction: "' + this.key + '"');
			}
		} }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
