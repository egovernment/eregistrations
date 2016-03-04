// Routes for the views.

'use strict';

var db         = require('mano').db
  , deferred   = require('deferred')
  , xhrGet     = require('mano/lib/client/xhr-driver').get
  , serverSync = require('mano/lib/client/server-sync');

module.exports = {
	'/': require('../view/manager-validation-users-table'),
	'new-user': require('../view/manager-validation-user-create'),
	'user/[0-9][0-9a-z-]+': {
		match: function (userId) {
			this.editedUser = db.User.getById(userId);
			if (this.editedUser === this.user) return false;
			if (this.editedUser) {
				if (this.user.recentlyVisited.users.last !== this.editedUser) {
					this.user.recentlyVisited.users.add(this.editedUser);
				}
				return true;
			}
			return xhrGet('/get-user-data/', { id: userId })(function (result) {
				var def;
				if (!result.passed) return false;
				this.editedUser = db.User.getById(userId);
				if (this.editedUser) return true;
				def = deferred();
				serverSync.once('sync', function () {
					this.editedUser = db.User.getById(userId);
					if (!this.editedUser) {
						def.reject(new Error("Data sync issue"));
						return;
					}
					def.resolve(true);
				}.bind(this));
				return def.promise;
			}.bind(this));
		},
		view: require('../view/manager-validation-user-edit')
	},
	profile: require('../view/user-profile')
};
