// Server specific controller for registration application.

'use strict';

var assign = require('es5-ext/object/assign');

// Common
module.exports = exports = assign(exports, require('../user/server-old-hash'));

exports['application-submit'] = {
	redirectUrl: '/'
};

// Registration controller used by Demo users.
exports.register = require('../my-account/server-old-hash').register;
