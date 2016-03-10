'use strict';

var oldClientHash  = require('mano-auth/utils/client-hash')
  , passwordSubmit = require('./server')['user/[0-9][a-z0-9]+'].submit;

// Common
module.exports = exports = require('./server');

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
