// User manager (aka notary) related properties

'use strict';

var memoize                     = require('memoizee/plain')
  , ensureDatabase              = require('dbjs/valid-dbjs')
  , _                           = require('mano').i18n.bind('Model')
  , definePropertyGroupsProcess = require('../lib/property-groups-process')
  , defineUser                  = require('./base')
  , defineUserBusinessProcesses = require('./business-processes')
  , defineStringLine            = require('dbjs-ext/string/string-line')
  , defineUInteger              = require('dbjs-ext/number/integer/u-integer');

module.exports = memoize(function (db/* options */) {
	var options = arguments[1]
	  , User = ensureDatabase(db).User || defineUser(db, options)
	  , PropertyGroupsProcess = definePropertyGroupsProcess(db)
	  , StringLine = defineStringLine(db)
	  , UInteger = defineUInteger(db)
	  , Role = db.Role;

	defineUserBusinessProcesses(User);
	Role.members.add('manager');
	Role.meta.get('manager').set('label', _("User Manager"));

	User.prototype.defineProperties({
		// 1. Normal user properties
		// If user was created by a manager, then its manager is assigned to this property
		manager: {
			type: User,
			reverse: 'managedCreatedUsers'
		},

		// 2. Manager user properties
		// Manager form sections
		managerDataForms: {
			type: PropertyGroupsProcess,
			nested: true
		},

		// All manager clients (resolved from list of users created by manager and
		// businessProcesses assinged to manager)
		managedUsers: {
			type: User,
			multiple: true,
			value: function (_observe) {
				var clients = [];

				// Users created by manager
				this.managedCreatedUsers.forEach(function (client) { clients.push(client); });

				// Users that handle business processes assigned to manager
				this.managedBusinessProcesses.forEach(function (businessProcess) {
					if (_observe(businessProcess._user)) clients.push(businessProcess.user);
				});

				return clients;
			}
		},
		// Holds the client user currently managed by the manager
		// it's used to switch to given client's my-account
		currentlyManagedUser: {
			type: User
		},
		// Used to validate account creation initialized by manager
		createManagedAccountToken: {
			type: StringLine
		},
		// equals true after manager requested account creation
		isInvitationSent: {
			type: db.Boolean
		},
		isManagerActive: {
			label: _("Is manager active?"),
			type: db.Boolean
		},

		// Due to involved relations to other objects, below two properties are not computed via
		// getters, but via persistence engine tracker configuration. See:
		// /server/services/compute-manager-relations-sizes.js
		//
		// How many submitted business proceses are handled by this user
		submittedBusinessProcessesSize: {
			type: UInteger,
			value: 0
		},
		// How many clients depend on this manger (depend in sense that it should not be allowed
		// to destroy manager)
		dependentManagedUsersSize: {
			type: UInteger,
			value: 0
		},

		// Whether user account can be destroyed from scope of manager
		canManagedUserBeDestroyed: {
			type: db.Boolean,
			value: function (_observe) {
				return !this.isActiveAccount && !this.submittedBusinessProcessesSize;
			}
		},

		// Whether state of this user (client) allows its (manager) user to be deleted
		canManagedUserParentBeDestroyed: {
			type: db.Boolean,
			value: function (_observe) {
				// If user has independent account then it can live without manager which created it
				// Otherwise do not allow deletion if there's any submitted business process
				return this.isActiveAccount || !this.submittedBusinessProcessesSize;
			}
		},
		// Can this manager account be destroyed
		canManagerBeDestroyed: {
			type: db.Boolean,
			value: function (_observe) {
				return this.roles.has('manager') && !this.dependentManagedUsersSize;
			}
		},
		destroyManagedUser: {
			type: db.Function,
			value: function (user) {
				var dbObjects = this.database.objects, err = new Error('Cannot destroy user', user.__id__);
				if (!this.managedUsers.has(user)) {
					throw err;
				}
				if (!user.canManagedUserBeDestroyed) {
					throw err;
				}
				user.initialBusinessProcesses.forEach(function (bp) {
					dbObjects.delete(bp);
				});
				dbObjects.delete(user);
			}
		},
		destroyManager: {
			type: db.Function,
			value: function (manager) {
				var dbObjects = this.database.objects
				  , err = new Error('Cannot destroy manager', manager.__id__);
				if (!this.roles.has('managerValidation') && !(this.roles.has('usersAdmin'))) {
					throw err;
				}
				if (!manager.canManagerBeDestroyed) {
					throw err;
				}
				manager.managedUsers.forEach(manager.destroyManagedUser, manager);
				dbObjects.delete(manager);
			}
		}
	});

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
