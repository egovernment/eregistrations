'use strict';

var normalizeOpts  = require('es5-ext/object/normalize-options')
  , memoize        = require('memoizee/plain')
  , ensureDatabase = require('dbjs/valid-dbjs')
  , defineUInteger = require('dbjs-ext/number/integer/u-integer')
  , _              = require('mano').i18n.bind('Model')
  , defineUser     = require('mano-auth/model/user')
  , defineRole     = require('mano-auth/model/role')
  , defineRoleMeta = require('./roles-meta')
  , definePerson   = require('../person');

module.exports = memoize(function (db/*, options */) {
	var options  = Object(arguments[1])
	  , Person   = definePerson(ensureDatabase(db), options)
	  , User     = defineUser(db, normalizeOpts(options, { Parent: Person }))
	  , Role     = defineRole(db)
	  , UInteger = defineUInteger(db);

	Role.members.add('user');
	Role.meta.get('user').set('label', _("User"));

	Role.define('isFlowRole', { type: db.Function, value: function (role) {
		var additionalFlowRoles = {
			dispatcher: true,
			supervisor: true
		};

		return this.isPartARole(role) || this.isOfficialRole(role) || additionalFlowRoles[role];
	} });

	Role.define('isPartARole', { type: db.Function, value: function (role) {
		switch (role) {
		case 'user':
		case 'manager':
		case 'managerValidation':
			return true;
		default:
			return false;
		}
	} });

	Role.define('isOfficialRole', { type: db.Function, value: function (role) {
		return (/^official[A-Z]/).test(role);
	} });

	User.prototype.defineProperties({
		// Used for some additional functionalities like institution switch,
		// used for demonstrational purposes
		isSuperUser: {
			label: _("Is super user?"),
			type: db.Boolean,
			inputHint: _("Whether account was made for presentation purposes. " +
				"If so, it may expose some extra system specific controls " +
				"(e.g. switch that allows to change institution or zone). Otherwise has no effect")
		},
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
		},
		// Collection of user's roles which contribute to flow
		flowRoles: { type: Role, multiple: true, value: function () {
			var result = [], db = this.database;

			this.roles.forEach(function (role) {
				if (db.Role.isFlowRole(role)) {
					result.push(role);
				}
			}, this);

			return result;
		} }
	});
	defineRoleMeta(User);

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
