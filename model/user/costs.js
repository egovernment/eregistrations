'use strict';

var memoize            = require('memoizee/plain')
  , validDb            = require('dbjs/valid-dbjs')
  , defineUser         = require('mano-auth/model/user')
  , defineStringLine   = require('dbjs-ext/string/string-line');

module.exports = memoize(function (db) {
	var User, StringLine;
	validDb(db);
	User       = defineUser(db);
	StringLine = defineStringLine(db);
	User.prototype.defineProperties({
		costs: {
			type: StringLine,
			multiple: true,
			value: function () {
				var costs = [];
				this.requestedRegistrations.forEach(function (regName) {
					var userRegistration =  this.registrations[regName];
					userRegistration.costs.forEach(function (cost) {
						costs.push(cost);
					});
				}, this);
				return costs;
			}
		}
	});

	return db.User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
