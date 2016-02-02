'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , ensureIterable   = require('es5-ext/iterable/validate-object')
  , Driver           = require('dbjs-persistence')
  , resolve          = require('path').resolve
  , mano             = require('mano');

module.exports = function (root, storageNames/*, dbDriverConf*/) {
	var dbDriverConf = arguments[2], driver;
	root = ensureString(root);
	ensureIterable(storageNames);
	if (dbDriverConf && dbDriverConf.driver) {
		driver = new dbDriverConf.driver(normalizeOptions(dbDriverConf,
			{ storageNames: storageNames }));
	} else {
		driver = new Driver({ path: resolve(root, 'data-local') });
	}
	mano.dbDriver = driver;
	return driver;
};
