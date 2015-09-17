// Collection views
// Used to transport calculated on server collection states to client

'use strict';

var ensureDatabase = require('dbjs/valid-dbjs');

module.exports = function (db) {
	return ensureDatabase(db).Object.newNamed('views');
};
