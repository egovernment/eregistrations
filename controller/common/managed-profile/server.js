'use strict';

var queryMaster = require('eregistrations/server/services/query-master/slave')
  , submit      = require('mano/utils/save');

exports['managed-profile'] = {
	submit: function () {
		var args = arguments, userId, currentEmail;
		if (!this.manager || !this.manager.currentlyManagedUser) {
			throw new Error("Access Forbidden");
		}
		userId = this.manager.currentlyManagedUser.__id__;
		currentEmail = this.manager.currentlyManagedUser.email;

		if (!currentEmail || (args[1][userId + '/email'] !== currentEmail)) {
			return queryMaster('ensureEmailNotTaken', {
				email: args[1][userId + '/email']
			}).then(function () {
				return submit.apply(this, args);
			}.bind(this), function (err) {
				console.log('ERROR');
				throw err;
			});
		}

		return submit.apply(this, args);
	}
};
