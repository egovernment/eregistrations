'use strict';

var server = require('mano/lib/client/server-sync')
  , reload = function () { window.location.href = '/'; };

module.exports = function (user) {
	user._currentRoleResolved.on('change', function (event) {
		if (event.oldValue == null) return;
		server.once('sync', reload);
	});
};
