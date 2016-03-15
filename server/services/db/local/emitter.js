'use strict';

var ensureIterable = require('es5-ext/iterable/validate-object')
  , mano           = require('mano');

module.exports = function (emitterHandler, storageNames/*, options*/) {
	var options = Object(arguments[2]), driver;
	driver = emitterHandler.getDriver('local', {
		storageNames: ensureIterable(storageNames),
		resolveAutoSaveFilter: options.resolveAutoSaveFilter
	});
	mano.dbDriver = driver;
	return driver;
};
