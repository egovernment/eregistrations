// Routes for the views.

'use strict';

var deferred                 = require('deferred')
  , db                       = require('mano').db
  , xhrGet                   = require('mano/lib/client/xhr-driver').get
  , serverSync               = require('mano/lib/client/server-sync')
  , includeProfileController = require('./utils/include-profile-controller');

module.exports = exports = {
	'/': require('../view/users-table'),
	'new-user': require('../view/user-create'),
	'user/[0-9][0-9a-z-]+': {
		match: function (userId) {
			this.editedUser = db.User.getById(userId);
			if (this.editedUser === this.user) return false;
			if (this.editedUser && this.editedUser.email) {
				if (this.user.recentlyVisited.users.last !== this.editedUser) {
					this.user.recentlyVisited.users.add(this.editedUser);
				}
				return true;
			}
			return xhrGet('/get-user-data/', { id: userId })(function (result) {
				var def;
				if (!result.passed) return false;
				this.editedUser = db.User.getById(userId);
				if (this.editedUser && this.editedUser.email) return true;
				def = deferred();
				serverSync.once('sync', function () {
					this.editedUser = db.User.getById(userId);
					if (!this.editedUser || !this.editedUser.email) {
						def.reject(new Error("Data sync issue"));
						return;
					}
					def.resolve(true);
				}.bind(this));
				return def.promise;
			}.bind(this));
		},
		view: require('../view/user-edit')
	}
};

includeProfileController(exports);
