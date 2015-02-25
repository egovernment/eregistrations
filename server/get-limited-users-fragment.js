'use strict';

var once                  = require('timers-ext/once')
  , getObjectsSetFragment = require('../model/get-objects-set-fragment')

  , max = Math.max;

var normalize = function (limitedUsers, applicable, preferred, limit) {
	var gap;

	limitedUsers._postponed_ += 1;
	// Remove ones which do not belong
	limitedUsers.forEach(function (user) {
		if (!applicable.has(user)) limitedUsers.delete(user);
	});

	// Remove eventual oversize
	while (limitedUsers.size > limit) limitedUsers.delete(limitedUsers.first);

	// Fill if possible
	gap = max(limit - limitedUsers.size, 0);
	if (gap) {
		preferred.some(function (user) {
			if (limitedUsers.has(user)) return;
			limitedUsers.add(user);
			if (!--gap) return true;
		});
		if (gap) {
			applicable.some(function (user) {
				if (limitedUsers.has(user)) return;
				limitedUsers.add(user);
				if (!--gap) return true;
			});
		}
	}
	limitedUsers._postponed_ -= 1;
};

module.exports = function (limitedUsers, applicable, preferred, userPass/*, options*/) {
	var options = Object(arguments[4]), limit = Number(options.limit);
	if (isNaN(limit)) limit = 10;
	normalize(limitedUsers, applicable, preferred, limit);
	limitedUsers.on('change', once(function () {
		normalize(limitedUsers, applicable, preferred, limit);
	}));
	return getObjectsSetFragment(limitedUsers, userPass, options.fragment);
};
