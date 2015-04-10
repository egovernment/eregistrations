'use strict';

var oldClientHash = require('mano-auth/utils/client-hash')
  , addUserSave   = require('./server')['user-add'].save
  , passwordSave  = require('./server')['user/[0-9][a-z0-9]+'].save;

// Common
module.exports = exports = require('./server');

// Add User
exports['user-add'].save = function (normalizedData, data) {
	normalizedData['User#/password'] =
		oldClientHash(normalizedData['User#/email'], normalizedData['User#/password']);
	return addUserSave.apply(this, arguments);
};

// Edit User
exports['user/[0-9][a-z0-9]+'] = {
	save: function (normalizedData, data) {
		if (this.propertyKey) {
			normalizedData[this.propertyKey] =
				oldClientHash(this.target.email, normalizedData[this.propertyKey]);
		}
		return passwordSave.apply(this, arguments);
	}
};
