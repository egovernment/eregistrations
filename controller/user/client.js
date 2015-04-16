'use strict';

var router = require('mano/client/post-router')

  , submit  = router.submit, remoteSubmit = router.remoteSubmit;

exports.login = require('mano-auth/controller/client/login');

exports.profile = {
	submit: function (normalizedData, data) {
		if (data.password || data['password-new']) return remoteSubmit.apply(this, arguments);
		return submit.apply(this, arguments);
	}
};
