'use strict';

var oldClientHash = require('mano-auth/utils/client-hash')
  , profileSave = require('./server').profile.save;

module.exports = exports = require('./server');

exports.profile = {
	save: function (normalizedData, data) {
		if (normalizedData.password || normalizedData['password-new']) {
			normalizedData.password = oldClientHash(this.user.email, normalizedData.password);
			normalizedData['password-new'] =
				oldClientHash(this.user.email, normalizedData['password-new']);
		}
		return profileSave.apply(this, arguments);
	}
};
