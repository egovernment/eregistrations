'use strict';

var server = require('mano/lib/client/server-sync')
  , isReadOnlyRender = require('mano/client/utils/is-read-only-render');

var reload = function () {
	localStorage._reload = '1';
	window.location.href = '/';
};

module.exports = function (user) {
	var inReload;
	if (isReadOnlyRender) return;
	user._appAccessId.on('change', function (event) {
		if (inReload) {
			console.log("App access id change ", event.oldValue, " -> ", event.newValue, ", ignored");
			return;
		}
		inReload = true;
		if (server.isSync) {
			console.log("App access id change ", event.oldValue, " -> ", event.newValue, ", immediate");
			reload();
		} else {
			console.log("App access id change ", event.oldValue, " -> ", event.newValue,
				", wait for sync");
			server.once('sync', function () {
				console.log("App access id: reload after sync");
				reload();
			});
		}
	});
	user._appName.on('change', function (event) {
		if (inReload) {
			console.log("App name change ", event.oldValue, " -> ", event.newValue, ", ignored");
			return;
		}
		inReload = true;
		if (server.isSync) {
			console.log("App name change ", event.oldValue, " -> ", event.newValue, ", immediate");
			reload();
		} else {
			console.log("App name change ", event.oldValue, " -> ", event.newValue,
				", wait for sync");
			server.once('sync', function () {
				console.log("App name: reload after sync");
				reload();
			});
		}
	});
};
