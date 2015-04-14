'use strict';

var memoize      = require('memoizee/plain')
  , validDbjs    = require('dbjs/valid-dbjs')
  , normalizeOpts = require('es5-ext/object/normalize-options')
  , definePerson = require('../person')
  , defineUser   = require('mano-auth/model/user');

module.exports = memoize(function (db/*, options */) {
	var options, Person;
	validDbjs(db);
	options = Object(arguments[1]);
	Person = definePerson(db, options);
	return defineUser(db, normalizeOpts(options, { Parent: Person }));
}, { normalizer: require('memoizee/normalizers/get-1')() });
