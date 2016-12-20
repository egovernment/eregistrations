// Client specific controller for registration application.

'use strict';

var assign = require('es5-ext/object/assign');

assign(exports, require('../user/client'), require('../demo-user/client')());
