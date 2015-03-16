'use strict';

var router = require('mano/client/post-router')

  , save  = router.save, remoteSave = router.remoteSave;

exports.login = require('mano-auth/controller/client/login');

exports.profile = {
	save: function (normalizedData, data) {
		if (data.password || data['password-new']) return remoteSave.apply(this, arguments);
		return save.apply(this, arguments);
	}
};
