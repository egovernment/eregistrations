'use strict';

var queryMaster = require('eregistrations/server/services/query-master/slave')
  , submit      = require('mano/utils/save');

exports['managed-profile'] = {
	submit: function () {
		var args = arguments, userId;
		if (!this.manager || !this.manager.currentlyManagedUser) {
			throw new Error("Access Forbidden");
		}
		userId = this.manager.currentlyManagedUser.__id__;

		if (args[1][userId + '/email']) {
			return queryMaster('ensureEmailNotTaken', {
				email: args[1][userId + '/email']
			}).then(function () {
				return submit.apply(this, args);
			}.bind(this));
		}

		return submit.apply(this, args);
	}
};
