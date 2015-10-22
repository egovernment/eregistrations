'use strict';

var server = require('mano/lib/client/server-sync')
  , reload = function () { window.location.href = '/'; };

module.exports = function (user, expected) {
	user.currentBusinessProcess._isAtDraft.on('change', function (event) {
		if (Boolean(event.newValue) === Boolean(event.oldValue)) return;
		if (event.newValue !== expected) return;
		server.once('sync', reload);
	});
};
