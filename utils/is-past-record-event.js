// Whether event concerns action that just happened or is it about
// record retrieved from storage.
// It's temporary solution that aims that events older than 10s are assumed as past
// There should be most likely something more bluetproof that would indicate that
// event origins from update and not from storage retrieval

'use strict';

var now = require('microtime-x');

module.exports = function (event) {
	return event.stamp < (now() - 1000 * 1000 * 10);
};
