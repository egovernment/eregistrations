// Statistics data holder

'use strict';

var ensureDatabase = require('dbjs/valid-dbjs');

module.exports = function (db) {
	return ensureDatabase(db).Object.newNamed('statistics');
};
