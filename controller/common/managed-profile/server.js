'use strict';

var queryMaster = require('eregistrations/server/services/query-master/slave')
  , submit      = require('mano/utils/save');

exports['managed-profile'] = {
	submit: function (data, normalizedData) {
		var args = arguments, userId, currentEmail;
		userId       = this.manager.currentlyManagedUser.__id__;
		currentEmail = this.manager.currentlyManagedUser.email;

		if (!currentEmail || (normalizedData[userId + '/email'] !== currentEmail)) {
			return queryMaster('ensureEmailNotTaken', {
				email: normalizedData[userId + '/email']
			}).then(function () {
				return submit.apply(this, args);
			}.bind(this));
		}

		return submit.apply(this, args);
	}
};
