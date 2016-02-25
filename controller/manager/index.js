'use strict';

var assign   = require('es5-ext/object/assign')
  , validate = require('mano/utils/validate')
  , mano     = require('mano')

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
exports['user-add'] = {
	validate: validate,
	redirectUrl: '/'
};

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = {
	match: matchUser,
	validate: Function.prototype,
	redirectUrl: '/'
};
