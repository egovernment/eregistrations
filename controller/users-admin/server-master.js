'use strict';

var assign = require('es5-ext/object/assign');

// Common
assign(exports, require('../user/server'));

// Add user
exports['user-add'] = require('mano-auth/controller/server-master/register');
