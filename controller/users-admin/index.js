'use strict';

var find           = require('es5-ext/array/#/find')
  , assign         = require('es5-ext/object/assign')
  , endsWith       = require('es5-ext/string/#/ends-with')
  , changePassword = require('mano-auth/controller/change-password').validate
  , register       = require('mano-auth/controller/register').validate
  , validate       = require('mano/utils/validate')
  , matchUser      = require('../utils/user-matcher')
  , customError    = require('es5-ext/error/custom')
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
		}), areRolesRemovable, normalizedData, newRoles;
		if (propertyKey) {
			if (data[propertyKey]) return changePassword.call(this, data);
			delete data[propertyKey];
		}
		delete data['password-repeat'];

		normalizedData = validate.call(this, data);
		newRoles = normalizedData[this.target.__id__ + '/roles'];
		if (newRoles) {
			newRoles = new Set(newRoles);
			areRolesRemovable = this.target.roles.every(function (role) {
				//role removal attempt
				if (!newRoles.has(role) && this.target.rolesMeta[role]) {
					return this.target.rolesMeta[role].canBeDestroyed;
				}
				return true;
			}, this);
			if (!areRolesRemovable) {
				throw customError("Role cannot be removed", 'CANNOT_REMOVE_ROLE');
			}
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
