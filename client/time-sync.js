'use strict';

var microtime = require('microtime-x')
  , get       = require('mano/lib/client/xhr-driver').get

  , clientTime = microtime();

get('/time-sync/').done(function (serverTime) {
	var correction;
	serverTime = Number(serverTime);
	correction = serverTime - clientTime;
	console.log("Server <-> Client time difference:", (correction / 1000000).toFixed(2) + "s");
	// Apply correction only if client's time is rushing intto future, or it's bigger than 3 seconds
	// (it's for now until we find more accurate mean for handling client/server time synchronization)
	if ((correction < 0) || (correction > (3 * 1000 * 1000))) microtime.correct(correction);
});
