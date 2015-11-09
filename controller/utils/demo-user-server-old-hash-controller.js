// Server side (old hash version) registration controller used by Demo users.

'use strict';

var Client = require('mano/lib/server/client')
  , oldClientHash  = require('mano-auth/utils/client-hash')
  , promisify  = require('deferred').promisify
  , bcrypt     = require('bcrypt')

  , genSalt = promisify(bcrypt.genSalt), hash = promisify(bcrypt.hash);

module.exports = function (controllers) {
	controllers.register = {
		submit: function (data) {
			var user = this.user
			  , userId = user.__id__
			  , password = oldClientHash(data[userId + '/email'], data[userId + '/password']);

			return hash(password, genSalt())(function (password) {
				user.password = password;
				user.firstName = data[userId + '/firstName'];
				user.lastName = data[userId + '/lastName'];
				user.email = data[userId + '/email'];
				user.delete('isDemo');

				if (this.req.isHtmlServerRendered) return;

				return Client.get(this.req)(function (client) {
					return { inSync: client.isSync };
				});
			}.bind(this));
		}
	};
};
