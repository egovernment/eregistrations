// User manager (notary) related properties

'use strict';

var memoize               = require('memoizee/plain')
  , ensureDatabase        = require('dbjs/valid-dbjs')
  , _                     = require('mano').i18n.bind('Model')
  , defineUser            = require('./base')
  , defineBusinessProcess = require('../lib/business-process-base');

module.exports = memoize(function (db/* options */) {
	var options             = arguments[1]
	  , User                = ensureDatabase(db).User || defineUser(db, options)
	  , BusinessProcessBase = defineBusinessProcess(db)
	  , Role                = db.Role;

	Role.members.add('manager');
	Role.meta.get('manager').label = _("User Manager");

	User.prototype.defineProperties({
		// Clients (users) of user manager
		clients: {
			type: User,
			multiple: true
		},
		// Returns all business processes handled by manager
		clientsBusinessProcesses: {
			type: BusinessProcessBase,
			multiple: true,
			value: function (_observe) {
				var result = [];
				this.clients.forEach(function (client) {
					_observe(client.businessProcesses).forEach(function (businessProcess) {
						result.push(businessProcess);
					});
				});
				return result.sort(function (a, b) { return a._lastOwnModified - b._lastOwnModified_; });
			}
		}
	});

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
