// Client specific controller.

'use strict';

var assign = require('es5-ext/object/assign');

assign(exports, require('../user/client'));

// Registration controller used by Demo users.
exports.register = require('mano-auth/controller/client/register-and-login');
