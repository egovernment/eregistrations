'use strict';

var db             = require('../../db')
  , defineDbjsDate = require('dbjs-ext/date-time/date');

module.exports = function (t, a) {
	var date;
	defineDbjsDate(db);
	date = new db.Date('2017-02-01');
	a(Number(t(date, 'daily')), Number(new db.Date('2017-02-02')));
	date = new db.Date('2017-02-01');
	a(Number(t(date, 'weekly')), Number(new db.Date('2017-02-08')));
	date = new db.Date('2017-02-01');
	a(Number(t(date, 'monthly')), Number(new db.Date('2017-03-01')));
	date = new db.Date('2017-02-01');
	a(Number(t(date, 'yearly')), Number(new db.Date('2018-02-01')));
};
