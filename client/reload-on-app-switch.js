'use strict';

var server = require('mano/lib/client/server-sync')
  , isReadOnlyRender = require('mano/client/utils/is-read-only-render')
  , reload = function () { window.location.href = '/'; };

module.exports = function (user) {
	var inReload;
	if (isReadOnlyRender) return;
	user._appAccessId.on('change', function (event) {
		if (inReload) return;
		inReload = true;
		if (server.isSync) reload();
		else server.once('sync', reload);
	});
	user._appName.on('change', function (event) {
		if (inReload) return;
		inReload = true;
		if (server.isSync) reload();
		else server.once('sync', reload);
	});
};
