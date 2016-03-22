'use strict';

var ensureObject    = require('es5-ext/object/valid-object')
  , ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , userEmailMap    = require('mano/lib/server/user-email-map');

//defined as closure to enable passing options
module.exports = function () {
	return function (query) {
		ensureObject(query);

		return userEmailMap.ensureUniq(ensureString(query.email));
	};
};
