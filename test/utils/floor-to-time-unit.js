'use strict';

var db             = require('../../db')
  , defineDbjsDate = require('dbjs-ext/date-time/date');

module.exports = function (t, a) {
	var date;
	defineDbjsDate(db);
	date = new db.Date('2017-02-01');
	a(Number(t(date, 'daily')), Number(date));
	// Wednesday, flor to Monday
	a(Number(t(date, 'weekly')), Number(new db.Date('2017-01-30')));
	a(Number(t(date, 'monthly')), Number(date));
	a(Number(t(date, 'yearly')), Number(new db.Date('2017-01-01')));
	// Sunday, floor to Monday
	date = new db.Date('2017-02-05');
	a(Number(t(date, 'weekly')), Number(new db.Date('2017-01-30')));
};
