'use strict';

var memoize           = require('memoizee/plain')
  , ensureType        = require('dbjs/valid-dbjs-type')
  , defineInstitution = require('../institution');

module.exports = memoize(function (User/* options */) {
	var db = ensureType(User).database, Institution;

	Institution = defineInstitution(db);

	return User.prototype.defineProperties({
		institution: {
			type: Institution
		}
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
