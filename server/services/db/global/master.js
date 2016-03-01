'use strict';

var ensureIterable = require('es5-ext/iterable/validate-object')
  , resolve = require('path').resolve
  , Driver  = require('dbjs-persistence')
  , mano    = require('mano');

module.exports = function (root, storageNames/*, options*/) {
	var options = Object(arguments[2]);
	var driver = new Driver({
		path: resolve(root, 'data'),
		name: 'global',
		storageNames: ensureIterable(storageNames),
		database: options.database
	});
	mano.dbDriverGlobal = driver;
	driver.isReceiver = true;
	return driver;
};
