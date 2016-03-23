'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db               = new Database()
	  , toDateInTimeZone = t(db);

	var mayanEndOfTheWorld = new Date(2012, 11, 21, 1, 1);

	a.deep(toDateInTimeZone(mayanEndOfTheWorld, 'America/Guatemala').valueOf(),
		new db.Date(2012, 11, 20).valueOf());
	a.deep(toDateInTimeZone(mayanEndOfTheWorld, 'Europe/Poland').valueOf(),
		new db.Date(2012, 11, 21).valueOf());
};
