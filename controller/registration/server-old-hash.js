// Server specific controller for registration application.

'use strict';

var assign = require('es5-ext/object/assign');

// Common
module.exports = exports = assign(exports, require('../user/server-old-hash'));

exports['application-submit'] = {
	redirectUrl: '/'
};

require('../utils/demo-user-server-controller')(exports);
