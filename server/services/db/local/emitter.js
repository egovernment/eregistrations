'use strict';

var ensureDatabase = require('dbjs/valid-dbjs')
  , EmitterHandler  = require('dbjs-persistence/emitter')
  , mano           = require('mano');

module.exports = function (db) {
	var handler = new EmitterHandler(ensureDatabase(db))
	  , driver = handler.getDriver('local');
	mano.dbDriver = driver;
	return driver;
};
