'use strict';

var router            = require('mano/server/post-router')
  , oldClientHash = require('mano-auth/utils/client-hash')
  , changeOwnPassword = require('mano-auth/controller/server/change-own-password').save

  , save  = router.save;

exports.login = require('../public/server-old-hash').login;

exports.profile = {
	save: function (normalizedData, data) {
		if (data.password || data['password-new']) {
			data.password = oldClientHash(data.email, data.password);
			data['password-new'] = oldClientHash(data.email, data['password-new']);
			return changeOwnPassword.apply(this, arguments);
		}
		return save.apply(this, arguments);
	}
};
