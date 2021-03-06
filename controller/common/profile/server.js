'use strict';

var submit = require('mano/utils/save')
  , changeOwnPassword = require('mano-auth/controller/server/change-own-password').submit;

exports.profile = {
	submit: function (normalizedData, data) {
		if (data.password || data['password-new']) return changeOwnPassword.apply(this, arguments);
		return submit.apply(this, arguments);
	}
};
