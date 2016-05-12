// Client specific controller.

'use strict';

var assign = require('es5-ext/object/assign');

assign(exports, require('../user/client'));

// Registration controller used by Demo users.
exports.register = require('mano-auth/controller/client/register-and-login');

exports['business-process/[0-9][a-z0-9]+/delete'] = {
	remoteSubmit: true,
	processResponse: function () { this.businessProcess._setValue_(); }
};
