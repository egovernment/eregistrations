// Routes for the views.

'use strict';

var assign = require('es5-ext/object/assign');

require('../../view/print-base');
require('../../view/user');

assign(exports, require('eregistrations/routes/user'));
