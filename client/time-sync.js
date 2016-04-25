'use strict';

var microtime = require('microtime-x')
  , get       = require('mano/lib/client/xhr-driver').get

  , abs = Math.abs, round = Math.round
  , a, b;

a = microtime();
get('time-sync').done(function (serverTime) {
	var clientTime, correction;
	b = microtime();
	clientTime = a + round((b - a) / 2);
	serverTime = Number(serverTime);
	correction = serverTime - clientTime;
	console.log("Server <-> Client time difference:", (correction / 1000000).toFixed(2) + "s");
	// Apply correction only if calculated difference is bigger than 3 seconds
	// (it's for now until we find more accurate mean for handling client/server time synchronization)
	if (abs(correction) > (3 * 1000 * 1000)) microtime.correct(correction);
});
