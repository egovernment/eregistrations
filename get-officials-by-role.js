'use strict';

var memoize = require('memoizee/plain'),
	officials = require('./officials');

module.exports = memoize(function (roleName) {
	var filter = officials.filter(function (user) {
		var observable = user._officialRole;
		observable.on('change', function (event) { filter.refresh(user); });
		return observable.value;
	});
	return filter;
});
