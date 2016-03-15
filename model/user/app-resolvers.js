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
				var appId = this.__id__, role = this.currentRoleResolved, businessProcess, user;
				if (!role) return appId;
				appId += '.' + role;
				if (role === 'manager') {
					if (_observe(this.managerDataForms._progress) !== 1) {
						appId += '.registration';
						return appId;
					}
					user = this.currentlyManagedUser;
					if (!user) return appId;
					appId += '.' + user.__id__;
				}
				if ((role === 'user') || (role === 'manager')) {
					businessProcess = this.currentBusinessProcess;
					if (businessProcess) appId += '.' + businessProcess.__id__;
				}
				if (/^official[A-Z]/.test(role)) appId += (this.appAccessIdOfficialPostfix || '');
				return appId;
			}
		},
		appAccessIdOfficialPostfix: {
			type: StringLine,
			value: ''
		},
		appName: {
			type: StringLine,
			value: function (_observe) {
				var role = this.currentRoleResolved, businessProcess;

				if (!role) return 'public';

				if ((role === 'user') || (role === 'manager')) {
					if (role === 'manager') {
						if (_observe(this.managerDataForms._progress) !== 1) return 'manager-registration';
						if (!this.currentlyManagedUser) return 'manager';
					}
					businessProcess = this.currentBusinessProcess;
					if (!businessProcess) {
						return this.appNameUser || 'public';
					}
					if (!_observe(businessProcess._isAtDraft)) return 'business-process-submitted';
					// Replace with camelToHyphen() when it'll be possible
					return 'business-process-' +
						businessProcess.constructor.__id__.slice('BusinessProcess'.length).toLowerCase();
				}

				if (/^official[A-Z]/.test(role)) return this.appNameOfficial;

				return role.replace(/([A-Z])/g, '-$1').toLowerCase();
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
				if (!role || !/^official[A-Z]/.test(role)) return;
				// Replace with role.camelToHyphen() when it'll be possible
				return role.replace(/([A-Z])/g, '-$1').toLowerCase();
			}
		}
	});
	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
