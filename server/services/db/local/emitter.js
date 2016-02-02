'use strict';

var ensureIterable = require('es5-ext/iterable/validate-object')
  , mano           = require('mano');

module.exports = function (emitterHandler, storageNames) {
	var driver = emitterHandler.getDriver('local', { storageNames: ensureIterable(storageNames) });
	mano.dbDriver = driver;
	return driver;
};
