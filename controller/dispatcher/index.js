// Controller for both server and client.

'use strict';

var assign = require('es5-ext/object/assign');

module.exports = assign(exports, require('../user'));

exports['assign-business-process'] = true;
