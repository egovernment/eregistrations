// Controller for both server and client.

'use strict';

var assign      = require('es5-ext/object/assign')
  , matchUser   = require('../utils/user-matcher')
  , submit      = require('mano/utils/save');

module.exports = assign(exports, require('../user'));

exports['user-add'] = {
	submit: function (data) {
		data['User#/roles'] = ['manager'];

		return submit.apply(this, arguments);
	},
	redirectUrl: function (data) {
		return '/user/' + this.target.__id__ + '/';
	}
};

exports['user/[0-9][a-z0-9]+'] = {
	match: matchUser
};

exports['request-create-manager-account/[0-9][a-z0-9]+'] = {
	match: matchUser,
	redirectUrl: function () {
		return '/user/' + this.targetId + '/';
	}
};

exports['user/[0-9][a-z0-9]+/set-activation'] = {
	match: matchUser
};

// Delete manager, the validation is currently handled in submit by destroyManagedUser
exports['user/[0-9][a-z0-9]+/delete'] = {
	match: matchUser,
	validate: Function.prototype,
	redirectUrl: '/'
};
