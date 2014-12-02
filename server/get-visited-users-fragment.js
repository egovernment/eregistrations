'use strict';

var once                = require('timers-ext/once')
  , getMultiObjFragment = require('eregistrations/model/get-objects-set-fragment')

  , max = Math.max;

var normalize = function (visitedUsers, applicable, preferred, limit) {
	var gap;

	visitedUsers._postponed_ += 1;
	// Remove ones which do not belong
	visitedUsers.forEach(function (user) {
		if (!applicable.has(user)) visitedUsers.delete(user);
	});

	// Remove eventual oversize
	while (visitedUsers.size > limit) visitedUsers.delete(visitedUsers.first);

	// Fill if possible
	gap = max(limit - visitedUsers.size, 0);
	if (gap) {
		preferred.some(function (user) {
			if (visitedUsers.has(user)) return;
			visitedUsers.add(user);
			if (!--gap) return true;
		});
		if (gap) {
			applicable.some(function (user) {
				if (visitedUsers.has(user)) return;
				visitedUsers.add(user);
				if (!--gap) return true;
			});
		}
	}
	visitedUsers._postponed_ -= 1;
};

module.exports = function (visitedUsers, applicable, preferred, userPass/*, options*/) {
	var options = Object(arguments[4]), limit = Number(options.limit);
	if (isNaN(limit)) limit = 10;
	normalize(visitedUsers, applicable, preferred, limit);
	visitedUsers.on('change', once(function () {
		normalize(visitedUsers, applicable, preferred, limit);
	}));
	return getMultiObjFragment(visitedUsers, userPass);
};
