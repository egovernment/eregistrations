// Server side registration controller used by Demo users.

'use strict';

var promisify   = require('deferred').promisify
  , bcrypt      = require('bcrypt')
  , submit      = require('mano/utils/save')

  , genSalt = promisify(bcrypt.genSalt), hash = promisify(bcrypt.hash);

module.exports = function (controllers) {
	controllers.register = {
		submit: function (normalizedData, data) {
			this.user.delete('isDemo');

			return hash(normalizedData[this.user.__id__ + '/password'],
				genSalt())(function (password) {
				var result = submit.call(this, normalizedData, data);
				this.user.password = password;
				return result;
			}.bind(this));
		}
	};
};
