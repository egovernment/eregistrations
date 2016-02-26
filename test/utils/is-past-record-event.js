'use strict';

module.exports = function (t, a) {
	a(t({ stamp: Date.now() * 1000 }), false);
	a(t({ stamp: (Date.now() * 1000) - (1000 * 1000 * 60) }), true);
};
