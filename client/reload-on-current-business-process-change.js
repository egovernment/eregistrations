'use strict';

var server = require('mano/lib/client/server-sync')
  , reload = function () { window.location.href = '/'; };

module.exports = function (user) {
	user._currentBusinessProcess.on('change', function (event) {
		server.once('sync', reload);
	});
};
