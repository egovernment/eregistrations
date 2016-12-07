'use strict';

var db             = require('../../db')
  , find           = require('es5-ext/array/#/find')
  , assign         = require('es5-ext/object/assign')
  , endsWith       = require('es5-ext/string/#/ends-with')
  , changePassword = require('mano-auth/controller/change-password').validate
  , register       = require('mano-auth/controller/register').validate
  , validate       = require('mano/utils/validate')
  , matchUser      = require('../utils/user-matcher')
  , Set            = require('es6-set')

  , keys = Object.keys;

// Common
assign(exports, require('../user'));

// Add User
exports['user-add'] = {
	validate: register,
	redirectUrl: '/'
};

// Edit User
exports['user/[0-9][a-z0-9]+'] = {
	match: matchUser,
	validate: function (data) {
		var propertyKey = find.call(keys(data), function (key) {
			return endsWith.call(key, '/password');
		}), normalizedData, newRoles;

		if (propertyKey && data[propertyKey]) {
			normalizedData = changePassword.call(this, data);
		} else {
			delete data[propertyKey];
			delete data['password-repeat'];
			normalizedData = validate.call(this, data);
		}
		newRoles = normalizedData[this.target.__id__ + '/roles'];
		if (newRoles) {
			newRoles = new Set(newRoles);
			this.target.roles.forEach(function (role) {
				//role removal attempt
				if (!newRoles.has(role) && this.target.rolesMeta[role]) {
					this.target.rolesMeta[role].validateDestroy();
				}
			}, this);
		}
		if (normalizedData[this.target.__id__ + '/isSuperUser']) {
			this.target.roles.forEach(function (role) {
				if (db.Role.isPartARole(role)) {
					this.target.rolesMeta[role].validateDestroy();
				}
			}, this);
		}

		return normalizedData;
	}
};

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = {
	match: matchUser,
	validate: Function.prototype,
	redirectUrl: '/'
};
