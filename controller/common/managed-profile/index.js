'use strict';

var validate = require('mano/utils/validate');

exports['managed-profile'] = true;

exports['managed-profile'] = {
	validate: function () {
		if (!this.manager || !this.manager.currentlyManagedUser) {
			throw new Error("Access Forbidden");
		}
		return validate.apply(this, arguments);
	}
};
