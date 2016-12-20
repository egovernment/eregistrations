// Client specific controller.

'use strict';

var assign = require('es5-ext/object/assign');

assign(exports, require('../user/client'), require('../demo-user/client')());

exports['business-process/[0-9][a-z0-9]+/delete'] = {
	remoteSubmit: true,
	processResponse: function () { this.businessProcess._setValue_(); }
};
