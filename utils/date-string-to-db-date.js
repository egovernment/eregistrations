'use strict';

var ensureDatabase = require('dbjs/valid-dbjs');

module.exports = function (db, date) {
	ensureDatabase(db);
	var resultDate = Date.parse(date);
	if (isNaN(resultDate)) throw new Error("Unrecognized date value: " + JSON.stringify(date));
	resultDate = new Date(resultDate);
	return new db.Date(resultDate.getUTCFullYear(), resultDate.getUTCMonth(),
		resultDate.getUTCDate());
};
