// Server specific controller.

'use strict';

var Client = require('mano/lib/server/client')
  , oldClientHash  = require('mano-auth/utils/client-hash')
  , assign = require('es5-ext/object/assign')
  , promisify  = require('deferred').promisify
  , bcrypt     = require('bcrypt')

  , genSalt = promisify(bcrypt.genSalt), hash = promisify(bcrypt.hash);

assign(exports, require('../user/server-old-hash'));

// Registration controller used by Demo users.
exports.register = {
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
