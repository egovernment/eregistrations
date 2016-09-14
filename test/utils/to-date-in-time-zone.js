'use strict';

var db         = require('../../db')
  , defineDate = require('dbjs-ext/date-time/date');

module.exports = function (t, a) {
	defineDate(db);

	var mayanEndOfTheWorld = new Date(2012, 11, 21, 1, 1);

	a.deep(t(mayanEndOfTheWorld, 'America/Guatemala').valueOf(),
		new db.Date(2012, 11, 20).valueOf());
	a.deep(t(mayanEndOfTheWorld, 'Europe/Poland').valueOf(),
		new db.Date(2012, 11, 21).valueOf());
};
