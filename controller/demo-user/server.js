// Server side registration controller used by Demo users.

'use strict';

var promisify   = require('deferred').promisify
  , bcrypt      = require('bcrypt')
  , submit      = require('mano/utils/save')
  , queryMaster = require('../../server/services/query-master/slave')

  , genSalt = promisify(bcrypt.genSalt), hash = promisify(bcrypt.hash);

module.exports = function () {
	return {
		register: {
			submit: function (normalizedData, data) {
				var user = this.user;
				user.delete('isDemo');
				return queryMaster('loadInitialBusinessProcesses', {
					userId: user.__id__
				})(function (hasInitialProcesses) {
					if (hasInitialProcesses) {
						user.initialBusinessProcesses.forEach(function (businessProcess) {
							businessProcess.delete('isDemo');
						});
					}
					return hash(normalizedData[user.__id__ + '/password'],
						genSalt())(function (password) {
						delete normalizedData[user.__id__ + '/password'];
						user.password = password;
						return submit.call(this, normalizedData, data);
					}.bind(this));
				}.bind(this));
			}
		}
	};
};
