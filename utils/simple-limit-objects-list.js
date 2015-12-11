// Limits provided objects list
// Used for limiting business processes list for given user
// Should be invoked only once per list (which is guaranteed by memoization)

'use strict';

var memoize   = require('memoizee/weak-plain')
  , ensureSet = require('es6-set/valid-set')
  , once      = require('timers-ext/once');

var normalize = function (list, limit) {
	if (list.size <= limit) return;

	list._postponed_ += 1;

	// Remove eventual oversize
	while (list.size > limit) list.delete(list.first);

	list._postponed_ -= 1;
};

module.exports = memoize(function (list/*, options*/) {
	var options = Object(arguments[1]), limit = Number(options.limit);
	if (isNaN(limit)) limit = 10;
	normalize(ensureSet(list), limit);
	list.on('change', once(function () { normalize(list, limit); }));
	return list;
}, { length: 1 });
