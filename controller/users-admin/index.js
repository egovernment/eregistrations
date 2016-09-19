'use strict';

var find           = require('es5-ext/array/#/find')
  , assign         = require('es5-ext/object/assign')
  , endsWith       = require('es5-ext/string/#/ends-with')
  , changePassword = require('mano-auth/controller/change-password').validate
  , register       = require('mano-auth/controller/register').validate
  , validate       = require('mano/utils/validate')
  , matchUser      = require('../utils/user-matcher')
  , customError    = require('es5-ext/error/custom')
  , includes       = require('es5-ext/string/#/contains')

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
		}), roles, areRolesRemovable;
		if (propertyKey) {
			if (data[propertyKey]) return changePassword.call(this, data);
			delete data[propertyKey];
		}
		delete data['password-repeat'];

		find.call(keys(data), function (key) {
			return endsWith.call(key, '/password');
		});
		roles = find.call(keys(data), function (key) {
			return endsWith.call(key, '/roles');
		});
		if (roles && data[roles]) {
			areRolesRemovable = this.target.roles.every(function (role) {
				//role removal attempt
				if (!includes.call(data[roles], role) && this.target.rolesMeta[role]) {
					return this.target.rolesMeta[role].canBeDestroyed;
				}
				return true;
			}.bind(this));
			if (!areRolesRemovable) {
				throw customError("Role cannot be removed", 'CANNOT_REMOVE_ROLE');
			}
		}
		return validate.call(this, data);
	}
};

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = {
	match: matchUser,
	validate: Function.prototype,
	redirectUrl: '/'
};
