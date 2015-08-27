// Server specific controller for registration application.

'use strict';

var assign = require('es5-ext/object/assign');

// Common
module.exports = exports = assign(exports, require('../user/server'));

exports['application-submit'] = {
	redirectUrl: '/'
};
