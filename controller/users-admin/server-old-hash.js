'use strict';

var oldClientHash = require('mano-auth/utils/client-hash')
  , passwordSave   = require('./server')['user/[0-9][a-z0-9]+'].save;

// Common
module.exports = exports = require('./server');

// Add User
exports['user-add'] = require('../public/server-old-hash').register;

// Edit User
exports['user/[0-9][a-z0-9]+'] = {
	save: function (normalizedData, data) {
		if (this.propertyKey) {
			data[this.propertyKey] = oldClientHash(this.target.email, this.propertyKey);
		}
		return passwordSave.call(this, normalizedData, data);
	}
};
