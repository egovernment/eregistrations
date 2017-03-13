'use strict';

var db             = require('../../db')
  , defineDbjsDate = require('dbjs-ext/date-time/date');

module.exports = function (t, a) {
	var dateFrom, dateTo;
	defineDbjsDate(db);
	dateFrom = new db.Date('2017-01-01');
	dateTo   = new db.Date('2017-01-02');
	a(t(dateFrom, dateTo, 'daily'), 2);
	dateTo   = new db.Date('2017-01-05');
	a(t(dateFrom, dateTo, 'daily'), 5);
	// 2017-01-01 is Sunday, so we span over two weeks
	a(t(dateFrom, dateTo, 'weekly'), 2);
	a(t(dateFrom, dateTo, 'monthly'), 1);
	a(t(dateFrom, dateTo, 'yearly'), 1);

	dateFrom = new db.Date('2016-01-01');
	dateTo   = new db.Date('2017-01-02');
	a(t(dateFrom, dateTo, 'yearly'), 2);
	a(t(dateFrom, dateTo, 'monthly'), 13);
	dateFrom = new db.Date('2016-12-31');
	a(t(dateFrom, dateTo, 'yearly'), 2);
	a(t(dateFrom, dateTo, 'monthly'), 2);
	dateFrom = new db.Date('2017-02-13');
	dateTo   = new db.Date('2017-02-19');
	a(t(dateFrom, dateTo, 'weekly'), 1);
	dateTo   = new db.Date('2017-02-20');
	a(t(dateFrom, dateTo, 'weekly'), 2);
};
