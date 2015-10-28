// Client specific controller customization.

'use strict';

var assign = require('es5-ext/object/assign');

// Common controller
assign(exports, require('eregistrations/controller/user/client'));

exports['save-translations'] = require('eregistrations/controller/client/save-translations');
