'use strict';

var router = require('mano/client/post-router')

  , submit  = router.submit, remoteSubmit = router.remoteSubmit;

exports.profile = {
	submit: function (normalizedData, data) {
		if (data.password || data['password-new']) return remoteSubmit.apply(this, arguments);
		return submit.apply(this, arguments);
	}
};

exports['request-create-managed-account/[0-9][a-z0-9]+'] = {
	remoteSubmit: true
};
