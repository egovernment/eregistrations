// Server specific controller customization.

'use strict';

var assign = require('es5-ext/object/assign');

// Common
assign(exports, require('eregistrations/controller/user/server'));

exports['save-translations'] = require('eregistrations/controller/server/save-translations');
