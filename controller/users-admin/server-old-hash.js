'use strict';

var router         = require('mano/server/post-router')
  , oldClientHash = require('mano-auth/utils/client-hash')
  , changePassword = require('mano-auth/controller/server/change-password').save

  , save  = router.save;

// Common
module.exports = exports = require('./server');

// Add User
exports['user-add'] = require('../public/server-old-hash').register;

// Edit User
exports['user/[0-9][a-z0-9]+'] = {
	save: function (normalizedData, data) {
		if (this.propertyKey) {
			data[this.propertyKey] = oldClientHash(data.email, this.propertyKey);
			return changePassword.apply(this, arguments);
		}
		return save.apply(this, arguments);
	}
};
