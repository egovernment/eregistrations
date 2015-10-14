'use strict';

var memoize           = require('memoizee/plain')
  , _                 = require('mano').i18n.bind("Model: User")
  , ensureType        = require('dbjs/valid-dbjs-type')
  , defineInstitution = require('../institution');

module.exports = memoize(function (User/* options */) {
	var db = ensureType(User).database, Institution;

	Institution = defineInstitution(db);

	return User.prototype.defineProperties({
		institution: {
			type: Institution,
			label: _("Institution")
		}
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
