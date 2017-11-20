'use strict';

var assign        = require('es5-ext/object/assign')
  , oldClientHash = require('mano-auth/utils/client-hash')
  , env           = require('mano').env
  , profileSubmit = require('./server').profile.submit;

assign(exports, require('./server'),
	require('../demo-user/server')({ oldClientHash: oldClientHash }));

if (!env.externalProfilePage) {
	exports.profile = {
		submit: function (normalizedData, data) {
			if (normalizedData.password || normalizedData['password-new']) {
				normalizedData.password = oldClientHash(this.user.email, normalizedData.password);
				normalizedData['password-new'] =
					oldClientHash(this.user.email, normalizedData['password-new']);
			}
			return profileSubmit.apply(this, arguments);
		}
	};
}
