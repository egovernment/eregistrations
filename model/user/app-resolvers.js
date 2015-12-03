// Current application name and access id resolver
// - App name is used to resolve application that should be served to user in web app
// - Access Id is used for resolution of recors which should be propagated to user web app,
//   in close future it will be also used for validation of changes coming from a clients

'use strict';

var memoize                     = require('memoizee/plain')
  , ensureDatabase              = require('dbjs/valid-dbjs')
  , defineStringLine            = require('dbjs-ext/string/string-line')
  , defineUser                  = require('./base')
  , defineUserBusinessProcesses = require('./business-processes');

module.exports = memoize(function (db/* options */) {
	var User = ensureDatabase(db).User || defineUser(db, arguments[1])
	  , StringLine = defineStringLine(db);

	defineUserBusinessProcesses(User, arguments[1]);

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
		},
		appName: {
			type: StringLine,
			value: function (_observe) {
				var role = this.currentRoleResolved, businessProcess;
				if (!role) return 'public';
				if (role === 'user') {
					businessProcess = this.currentBusinessProcess;
					if (!businessProcess) return this.appNameUser || 'public';
					if (!_observe(businessProcess._isAtDraft)) return 'business-process-submitted';
					// Replace with camelToHyphen() when it'll be possible
					return 'business-process-' +
						businessProcess.constructor.__id__.slice('BusinessProcess'.length).toLowerCase();
				}
				if (role === 'metaAdmin') return 'meta-admin';
				if (role === 'usersAdmin') return 'users-admin';
				if (role.indexOf('official-') !== 0) return 'public';
				return this.appNameOfficial;
			}
		},
		appNameUser: {
			type: StringLine,
			value: 'user'
		},
		appNameOfficial: {
			type: StringLine,
			value: function () {
				var role = this.currentRoleResolved;
				if (!role || (role.indexOf('official-') !== 0)) return;
				// Replace with role.camelToHyphen() when it'll be possible
				return role.replace(/([A-Z])/g, '-$1');
			}
		}
	});
	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
