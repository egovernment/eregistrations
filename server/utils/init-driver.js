'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , ensureIterable   = require('es5-ext/iterable/validate-object')
  , Driver           = require('dbjs-persistence')
  , resolve          = require('path').resolve
  , mano             = require('mano');

module.exports = function (root, storageNames/*, dbDriverConf*/) {
	var dbDriverConf = arguments[2], driver, options;
	root = ensureString(root);
	options = { storageNames: ensureIterable(storageNames), name: 'local' };
	if (dbDriverConf && dbDriverConf.driver) {
		driver = new dbDriverConf.driver(normalizeOptions(dbDriverConf, options));
	} else {
		driver = new Driver(normalizeOptions({ path: resolve(root, 'data-local') }, options));
	}
	mano.dbDriver = driver;
	return driver;
};
