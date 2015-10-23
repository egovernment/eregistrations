// Current "Application Access Id" resolver.
// Application Access Id is used for access resolution which decides which records are propagated
// reactively to client when it's connected to server
// In close future it will be also used for validation of changes coming from a clients

'use strict';

var memoize                     = require('memoizee/plain')
  , ensureDatabase              = require('dbjs/valid-dbjs')
  , defineStringLine            = require('dbjs-ext/string/string-line')
  , defineUser                  = require('./base')
  , defineUserBusinessProcesses = require('./business-processes');

module.exports = memoize(function (db/* options */) {
	var User = ensureDatabase(db).User || defineUser(db, arguments[1])
	  , StringLine = defineStringLine(db);

	defineUserBusinessProcesses(User);

	User.prototype.defineProperties({
		appAccessId: {
			type: StringLine,
			value: function (_observe) {
				var appId = this.__id__, role = this.currentRoleResolved, businessProcess;
				if (!role) return appId;
				appId += '.' + role;
				if (role !== 'user') return appId;
				businessProcess = this.currentBusinessProcess;
				if (!businessProcess) return appId;
				appId += '.' + businessProcess.__id__;
				return appId;
			}
		}
	});
	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
