// Server specific controller customization.

'use strict';

var submit;

module.exports = exports = require('eregistrations/controller/users-admin/server');

submit = exports['user-add'].submit;
exports['new-user'] = {
	submit: function () {
		return submit.apply(this, arguments);
	}
};
