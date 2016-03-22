var ensureObject    = require('es5-ext/object/valid-object')
  , ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , serializeValue  = require('dbjs/_setup/serialize/value')
  , userEmailMap    = require('mano/lib/server/user-email-map');

//defined as closure to enable passing options
module.exports = function () {
	return function (query) {
		var email;
		ensureObject(query);

		return userEmailMap.ensureUniq(ensureString(query.email));
	}
};
