'use strict';

var normalizeOpts  = require('es5-ext/object/normalize-options')
  , memoize        = require('memoizee/plain')
  , ensureDatabase = require('dbjs/valid-dbjs')
  , defineUser     = require('mano-auth/model/user')
  , defineRole     = require('mano-auth/model/role')
  , definePerson   = require('../person');

module.exports = memoize(function (db/*, options */) {
	var options = Object(arguments[1])
	  , Person = definePerson(ensureDatabase(db), options)
	  , User = defineUser(db, normalizeOpts(options, { Parent: Person }));
	defineRole(db);
	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
