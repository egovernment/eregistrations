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
		requirements: {
			type: StringLine,
			multiple: true,
			value: function () {
				var reqs = [];
				this.requestedRegistrations.forEach(function (regName) {
					var userRegistration =  this.registrations[regName];
					userRegistration.requirements.forEach(function (req) {
						reqs.push(req);
					});
				}, this);
				return reqs;
			}
		}
	});

	return db.User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
