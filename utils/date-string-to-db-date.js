'use strict';

module.exports = function (db, date) {
	date = Date.parse(date);
	if (isNaN(date)) throw new Error("Unrecognized date value" + JSON.stringify(date));
	date = new Date(date);
	return new db.Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};
