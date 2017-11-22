// Server side registration controller used by Demo users.

'use strict';

var submit                        = require('mano/utils/save')
  , hash                          = require('mano-auth/hash')
  , queryMaster                   = require('../../server/services/query-master/slave')
  , sendNotification              = require('../../server/email-notifications/create-account')
  , genId                         = require('time-uuid')
  , env                           = require('mano').env
  , isAccountConfirmationDisabled = env && env.isAccountConfirmationDisabled
  , externalAuthentication        = (env && env.externalAuthentication) || {};

module.exports = function (/* options */) {
	var options     = Object(arguments[0])
	  , controllers = {};

	if (!externalAuthentication.registerPage) {
		controllers.register = {
			submit: function (normalizedData, data) {
				var user = this.user;
				user.delete('isDemo');
				return queryMaster('loadInitialBusinessProcesses', {
					userId: user.__id__
				})(function () {
					var password;
					user.initialBusinessProcesses.forEach(function (businessProcess) {
						businessProcess.delete('isDemo');
					});
					password = options.oldClientHash ?
							options.oldClientHash(normalizedData[user.__id__ + '/email'],
								normalizedData[user.__id__ + '/password']) :
									normalizedData[user.__id__ + '/password'];
					return hash.hash(password)(function (hashedPassword) {
						var result;
						delete normalizedData[user.__id__ + '/password'];
						user.password = hashedPassword;
						if (!isAccountConfirmationDisabled) {
							user.createAccountToken = genId();
						}
						result = submit.call(this, normalizedData, data);
						if (result) {
							sendNotification(user).done(null, function (err) {
								console.log("Cannot send email", err, err.stack);
							});
						}
						return result;
					}.bind(this));
				}.bind(this));
			}
		};
	}

	return controllers;
};
