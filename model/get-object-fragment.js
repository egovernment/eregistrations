'use strict';

var object      = require('es5-ext/object/valid-object')
  , memoize     = require('memoizee')
  , dbjsObject  = require('dbjs/valid-dbjs-object')
  , objFragment = require('dbjs-fragment/object-family');

module.exports = memoize(function (user, rules) {
	return objFragment(dbjsObject(user), object(rules));
});
