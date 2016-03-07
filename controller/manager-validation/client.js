// Client specific controller customization.

'use strict';

var assign = require('es5-ext/object/assign');

assign(exports, require('../user/client'));

// Add User
exports['user-add'] = { remoteSubmit: true };

// Delete User
exports['user/[0-9][a-z0-9]+/delete'] = { remoteSubmit: true };
