// Server specific controller.

'use strict';

var assign = require('es5-ext/object/assign');

assign(exports, require('../user/server-old-hash'));

require('../utils/demo-user-server-old-hash-controller')(exports);
