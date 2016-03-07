'use strict';

var assign = require('es5-ext/object/assign');

// Common
assign(exports, require('../user/server'));

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = {
	submit: function () { this.user.destroyManager(this.target); }
};
