'use strict';

var oldClientHash = require('mano-auth/utils/client-hash')
  , profileSave = require('./server').profile.save;

module.exports = exports = require('./server');

exports.profile = {
	save: function (normalizedData, data) {
		if (data.password || data['password-new']) {
			data.password = oldClientHash(this.target.email, data.password);
			data['password-new'] = oldClientHash(this.target.email, data['password-new']);
		}
		return profileSave.call(this, normalizedData, data);
	}
};
