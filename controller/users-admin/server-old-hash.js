'use strict';

var oldClientHash = require('mano-auth/utils/client-hash')
  , addUserSubmit   = require('./server')['user-add'].submit
  , passwordSubmit  = require('./server')['user/[0-9][a-z0-9]+'].submit;

// Common
module.exports = exports = require('./server');

// Add User
exports['user-add'].submit = function (normalizedData, data) {
	normalizedData['User#/password'] =
		oldClientHash(normalizedData['User#/email'], normalizedData['User#/password']);
	return addUserSubmit.apply(this, arguments);
};

// Edit User
exports['user/[0-9][a-z0-9]+'] = {
	submit: function (normalizedData, data) {
		if (this.propertyKey) {
			normalizedData[this.propertyKey] =
				oldClientHash(this.target.email, normalizedData[this.propertyKey]);
		}
		return passwordSubmit.apply(this, arguments);
	}
};
