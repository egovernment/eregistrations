'use strict';

var find           = require('es5-ext/array/#/find')
  , assign         = require('es5-ext/object/assign')
  , endsWith       = require('es5-ext/string/#/ends-with')
  , changePassword = require('mano-auth/controller/change-password').validate
  , register       = require('mano-auth/controller/register').validate
  , validate       = require('mano/utils/validate')
  , mano           = require('mano')

  , keys = Object.keys
  , db = mano.db;

var matchUser = function (id) {
	var target = db.User.getById(id);
	if (!target) return false;
	this.target = target;
	return true;
};

// Common
assign(exports, require('../user'));

// Add User
exports['add-user'] = {
	validate: register,
	redirectUrl: '/'
};

// TODO: Remove after all apps use new split processes POST router
exports['user-add'] = exports['add-user'];

// Edit User
exports['user/[0-9][a-z0-9]+'] = {
	match: matchUser,
	validate: function (data) {
		var propertyKey = find.call(keys(data), function (key) {
			return endsWith.call(key, '/password');
		});
		if (propertyKey) {
			if (data[propertyKey]) return changePassword.call(this, data);
			delete data[propertyKey];
		}
		delete data['password-repeat'];
		return validate.call(this, data);
	}
};

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = {
	match: matchUser,
	validate: Function.prototype,
	redirectUrl: '/'
};
