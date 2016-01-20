// User manager (aka notary) related properties

'use strict';

var memoize                     = require('memoizee/plain')
  , ensureDatabase              = require('dbjs/valid-dbjs')
  , _                           = require('mano').i18n.bind('Model')
  , defineUser                  = require('./base')
  , defineUserBusinessProcesses = require('./business-processes');

module.exports = memoize(function (db/* options */) {
	var options = arguments[1]
	  , User    = ensureDatabase(db).User || defineUser(db, options)
	  , Role    = db.Role;

	defineUserBusinessProcesses(User);
	Role.members.add('manager');
	Role.meta.get('manager').label = _("User Manager");

	User.prototype.defineProperties({
		// If user was created by a manager, then its manager is assigned here
		manager: {
			type: User,
			reverse: 'createdClients'
		},
		// All manager clients (resolved from businessProcesses assinged to manager)
		clients: {
			type: User,
			multiple: true,
			value: function (_observe) {
				var clients = [];

				// Users created by manager
				this.createdClients.forEach(function (client) { clients.push(client); });

				// Users that handle business processes assigned to manager
				this.clientBusinessProcesses.forEach(function (businessProcess) {
					if (_observe(businessProcess._user)) clients.push(businessProcess.user);
				});

				return clients;
			}
		}
	});

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
