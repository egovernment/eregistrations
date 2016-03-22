'use strict';

var router = require('mano/client/post-router')
  , assign = require('es5-ext/object/assign')


  , submit  = router.submit, remoteSubmit = router.remoteSubmit;

assign(exports, require('../common/managed-profile/client'));

exports.profile = {
	submit: function (normalizedData, data) {
		if (data.password || data['password-new']) return remoteSubmit.apply(this, arguments);
		return submit.apply(this, arguments);
	}
};

exports['request-create-managed-account'] = {
	remoteSubmit: true
};
