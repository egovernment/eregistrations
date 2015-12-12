'use strict';

var server = require('mano/lib/client/server-sync')
  , isReadOnlyRender = require('mano/client/utils/is-read-only-render')
  , reload = function () { window.location.href = '/'; };

module.exports = function (user) {
	if (isReadOnlyRender) return;
	user._appAccessId.on('change', function (event) {
		if (server.isSync) reload();
		else server.once('sync', reload);
	});
};
