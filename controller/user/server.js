'use strict';

var router            = require('mano/server/post-router')
  , changeOwnPassword = require('mano-auth/controller/server/change-own-password').save

  , save  = router.save;

exports.login = require('mano-auth/controller/server/login');

exports.profile = {
	save: function (normalizedData, data) {
		if (data.password || data['password-new']) return changeOwnPassword.apply(this, arguments);
		return save.apply(this, arguments);
	}
};
