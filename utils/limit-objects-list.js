// Limits provided objects list
// Used for limiting business processes list for given user
// Should be invoked only once per list (which is guaranteed by memoization)

'use strict';

var memoize     = require('memoizee/weak-plain')
  , ensureArray = require('es5-ext/array/valid-array')
  , ensureSet   = require('es6-set/valid-set')
  , once        = require('timers-ext/once')

  , max = Math.max;

var normalize = function (list, applicable, preferred, limit) {
	var gap;

	list._postponed_ += 1;

	// Remove ones which do not belong
	list.forEach(function (object) {
		if (!applicable.has(object)) list.delete(object);
	});

	// Remove eventual oversize
	while (list.size > limit) list.delete(list.first);

	if (preferred) {
		// Fill if possible
		gap = max(limit - list.size, 0);
		if (gap) {
			preferred.some(function (object) {
				if (list.has(object)) return;
				list.add(object);
				if (!--gap) return true;
			});
			if (gap) {
				applicable.some(function (object) {
					if (list.has(object)) return;
					list.add(object);
					if (!--gap) return true;
				});
			}
		}
	}
	list._postponed_ -= 1;
};

module.exports = memoize(function (list, applicable/*, options*/) {
	var options = Object(arguments[2]), limit = Number(options.limit)
	  , preferred;
	if (isNaN(limit)) limit = 10;
	applicable = ensureSet(applicable);
	if (options.preferred != null) preferred = ensureArray(options.preferred);
	normalize(ensureSet(list), applicable, preferred, limit);
	list.on('change', once(function () { normalize(list, applicable, preferred, limit); }));
	return list;
}, { length: 1 });
