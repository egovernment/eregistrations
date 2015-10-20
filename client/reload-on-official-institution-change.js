'use strict';

var server = require('mano/lib/client/server-sync')
  , reload = function () { window.location.href = '/'; };

module.exports = function (user) {
	user._institution.on('change', function (event) {
		if (event.newValue === event.oldValue) return;
		server.once('sync', reload);
	});
};
