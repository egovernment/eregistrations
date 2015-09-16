// Provides compare function for getIndex function
// Assure that same compare function will be returned for same getIndex functions

'use strict';

var ensureCallable = require('es5-ext/object/valid-callable')
  , memoize        = require('memoizee/plain');

module.exports = memoize(function (getIndex, reverse) {
	return reverse
		? function (a, b) { return getIndex(b) - getIndex(a); }
		: function (a, b) { return getIndex(a) - getIndex(b); };
}, {
	normalizer: require('memoizee/normalizers/get-fixed')(2),
	resolvers: [ensureCallable, Boolean]
});
