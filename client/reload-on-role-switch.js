'use strict';

var server = require('mano/lib/client/server-sync')
  , reload = function () { window.location.href = '/'; };

module.exports = function (user) {
	user._currentRoleResolved.on('change', function () {
		server.once('sync', reload);
	});
};
