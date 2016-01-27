// Collection views
// Used to transport calculated on server collection states to client

'use strict';

var ensureDatabase      = require('dbjs/valid-dbjs')
  , defineDataSnapshots = require('./lib/data-snapshots')
  , memoize             = require('memoizee/plain');

module.exports = memoize(function (db) {
	defineDataSnapshots(db);
	return ensureDatabase(db).Object.newNamed('views');
},  { normalizer: require('memoizee/normalizers/get-1')() });
