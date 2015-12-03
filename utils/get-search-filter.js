// Returns filter function, that for preprovided property names
// checks wether in given object values for those property names match provided strings
// Used in seach functionality in business process table

'use strict';

var includes = require('es5-ext/string/#/contains')
  , memoize  = require('memoizee/plain');

module.exports = memoize(function (query) {
	return function (object) {
		var searchString = object.searchString;
		if (!searchString) return false;
		return includes.call(searchString, query);
	};
});
