'use strict';

var server = require('mano/lib/client/server-sync')
  , reload = function () { window.location.href = '/'; };

module.exports = function (user) {
	user.currentBusinessProcess._isApplicationCompleted.on('change', function (event) {
		if (Boolean(event.newValue) === Boolean(event.oldValue)) return;
		if (!event.newValue) return;
		server.once('sync', reload);
	});
};
