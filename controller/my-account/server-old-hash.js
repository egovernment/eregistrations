// Server specific controller.

'use strict';

var assign = require('es5-ext/object/assign');

// Common
assign(exports, require('../user/server-old-hash'), require('../demo-user/server')());
