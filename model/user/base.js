'use strict';

var normalizeOpts  = require('es5-ext/object/normalize-options')
  , memoize        = require('memoizee/plain')
  , ensureDatabase = require('dbjs/valid-dbjs')
  , defineUInteger = require('dbjs-ext/number/integer/u-integer')
  , _              = require('mano').i18n.bind('Model')
  , defineUser     = require('mano-auth/model/user')
  , defineRole     = require('mano-auth/model/role')
  , definePerson   = require('../person');

module.exports = memoize(function (db/*, options */) {
	var options  = Object(arguments[1])
	  , Person   = definePerson(ensureDatabase(db), options)
	  , User     = defineUser(db, normalizeOpts(options, { Parent: Person }))
	  , Role     = defineRole(db)
	  , UInteger = defineUInteger(db);

	Role.members.add('user');
	Role.meta.get('user').set('label', _("User"));

	User.prototype.defineProperties({
		// This is resolved on server and propagated (in resolved form to client)
		// The client will never have a password so it needs to rely on server
		isActiveAccount: {
			type: db.Boolean,
			value: function () {
				if (this.isDemo) return false;
				if (!this.email) return false;
				return this.password;
			}
		},
		// String over which users can be searched
		// through interface panel (computed value is later indexed by persistence engine)
		searchString: { type: db.String, value: function (_observe) {
			var arr = [];
			if (this.firstName) arr.push(this.firstName.toLowerCase());
			if (this.lastName) arr.push(this.lastName.toLowerCase());
			if (this.email) arr.push(this.email.toLowerCase());

			return arr.join('\x02');
		} },
		// Due to involved relations to other objects, below property is not computed via
		// getter, but via persistence engine tracker configuration. See:
		// /server/services/compute-manager-relations-sizes.js
		//
		// How many submitted business processes are handled by this user
		submittedBusinessProcessesSize: {
			type: UInteger,
			value: 0
		}
	});

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
