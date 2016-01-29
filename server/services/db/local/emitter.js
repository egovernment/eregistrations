'use strict';

var ensureDatabase = require('dbjs/valid-dbjs')
  , EmitterDriver  = require('dbjs-persistence/emitter')
  , mano           = require('mano');

module.exports = function (db) {
	var driver = new EmitterDriver(ensureDatabase(db));
	mano.dbDriver = driver;
	return driver;
};
