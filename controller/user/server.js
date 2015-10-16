'use strict';

var router            = require('mano/server/post-router')
  , changeOwnPassword = require('mano-auth/controller/server/change-own-password').submit

  , submit  = router.submit;

exports.login = require('mano-auth/controller/server/login');

exports.profile = {
	submit: function (normalizedData, data) {
		if (data.password || data['password-new']) return changeOwnPassword.apply(this, arguments);
		return submit.apply(this, arguments);
	}
};

// Active Business Process change
exports['change-business-process'] = {
	redirectUrl: '/'
};
