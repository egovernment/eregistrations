// Intializes recompute slave process

'use strict';

if (process.env.DEBUG) process.env.DEBUG += ',-image-processing';

var ensureCallable = require('es5-ext/object/valid-callable')
  , ensureObject   = require('es5-ext/object/valid-object')
  , ensureDatabase = require('dbjs/valid-dbjs')
  , recompute      = require('dbjs-persistence/recompute/slave')
  , mano           = require('mano');

module.exports = function (data) {
	var database = ensureDatabase(ensureObject(data).database)
	  , setupIndexes = ensureCallable(data.setupIndexes)
	  , slave = recompute(database);

	mano.dbDriver = slave.driver;
	setupIndexes();
	slave.initialize();
	return slave;
};
