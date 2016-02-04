'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , ensureIterable   = require('es5-ext/iterable/validate-object')
  , Driver           = require('dbjs-persistence')
  , resolve          = require('path').resolve
  , mano             = require('mano');

module.exports = function (root, storageNames/*, dbDriverConf, options*/) {
	var dbDriverConf = arguments[2], driver, driverOptions, options = Object(arguments[3]);
	root = ensureString(root);
	driverOptions = { storageNames: ensureIterable(storageNames), name: 'local',
		database: options.database };
	if (dbDriverConf && dbDriverConf.driver) {
		driver = new dbDriverConf.driver(normalizeOptions(dbDriverConf, driverOptions));
	} else {
		driver = new Driver(normalizeOptions({ path: resolve(root, 'data-local') }, driverOptions));
	}
	mano.dbDriver = driver;
	return driver;
};
