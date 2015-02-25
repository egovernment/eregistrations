'use strict';

var includes      = require('es5-ext/string/#/contains')
  , array         = require('es5-ext/array/valid-array')
  , memoize       = require('memoizee/plain')
  , propertyNames = array(require('mano').searchableUserPropertyNames)

  , toLowerCase = String.prototype.toLowerCase;

module.exports = memoize(function (query) {
	return function (user) {
		return propertyNames.some(function (name) {
			if (!user[name]) return;
			return includes.call(toLowerCase.call(user[name]), query);
		});
	};
});
