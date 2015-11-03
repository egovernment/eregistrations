// Server specific controller.

'use strict';

var assign = require('es5-ext/object/assign');

// Common
assign(exports, require('../user/server'));

// Registration controller used by Demo users.
exports.register = {
	submit: function (normalizedData, data) {
		this.user.delete('isDemo');

		return exports.profile.submit.apply(this, arguments);
	}
};
