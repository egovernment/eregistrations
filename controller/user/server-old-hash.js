'use strict';

var oldClientHash = require('mano-auth/utils/client-hash')
  , profileSubmit = require('./server').profile.submit;

module.exports = exports = require('./server');

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
