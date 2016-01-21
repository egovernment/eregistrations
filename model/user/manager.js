// User manager (aka notary) related properties

'use strict';

var memoize                     = require('memoizee/plain')
  , ensureDatabase              = require('dbjs/valid-dbjs')
  , _                           = require('mano').i18n.bind('Model')
  , definePropertyGroupsProcess = require('../lib/property-groups-process')
  , defineUser                  = require('./base')
  , defineUserBusinessProcesses = require('./business-processes');

module.exports = memoize(function (db/* options */) {
	var options = arguments[1]
	  , User = ensureDatabase(db).User || defineUser(db, options)
	  , PropertyGroupsProcess = definePropertyGroupsProcess(db)
	  , Role = db.Role;

	defineUserBusinessProcesses(User);
	Role.members.add('manager');
	Role.meta.get('manager').label = _("User Manager");

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
		}
	});

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
