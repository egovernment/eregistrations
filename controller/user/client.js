'use strict';

var router = require('mano/client/post-router')
  , env    = require('mano').env
  , assign = require('es5-ext/object/assign')

  , submit  = router.submit, remoteSubmit = router.remoteSubmit;

assign(exports, require('../common/managed-profile/client'),
	require('../common/request-create-account/client'));

if (!env.externalProfilePage) {
	exports.profile = {
		submit: function (normalizedData, data) {
			if (data.password || data['password-new']) return remoteSubmit.apply(this, arguments);
			return submit.apply(this, arguments);
		}
	};
}
