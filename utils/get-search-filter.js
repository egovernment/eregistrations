'use strict';

var includes     = require('es5-ext/string/#/contains')
  , ensureArray  = require('es5-ext/array/valid-array')
  , ensureString = require('es5-ext/object/validate-stringifiable-value')
  , memoize      = require('memoizee/plain')

  , toLowerCase = String.prototype.toLowerCase;

module.exports = memoize(function (propertyNames) {
	propertyNames = ensureArray(propertyNames).map(ensureString);
	return memoize(function (query) {
		return function (object) {
			return propertyNames.some(function (name) {
				if (!object[name]) return false;
				return includes.call(toLowerCase.call(object[name]), query);
			});
		};
	});
});
