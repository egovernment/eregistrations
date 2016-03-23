'use strict';

var ensureString    = require('es5-ext/object/validate-stringifiable-value')
  , userEmailMap    = require('mano/lib/server/user-email-map');

//defined as closure to enable passing options
module.exports = function () {
	return function (email) {
		return userEmailMap.ensureUniq(ensureString(email));
	};
};
