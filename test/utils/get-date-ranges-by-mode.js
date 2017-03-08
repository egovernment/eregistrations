'use strict';

var db             = require('../../db')
  , defineDbjsDate = require('dbjs-ext/date-time/date');

var compare = function (ranges, expectedRanges, a) {
	ranges.forEach(function (item, index) {
		a(Number(item.dateFrom), Number(expectedRanges[index].dateFrom));
		a(Number(item.dateTo), Number(expectedRanges[index].dateTo));
	});
};

module.exports = function (t, a) {
	var dateFrom, dateTo, mode, ranges, expectedRanges;
	defineDbjsDate(db);
	dateFrom = new db.Date('2017-02-01');
	dateTo   = new db.Date('2017-02-03');
	mode     = 'daily';

	ranges = t(dateFrom, dateTo, mode);
	expectedRanges = [
		{ dateFrom: new db.Date('2017-02-01'), dateTo: new db.Date('2017-02-01') },
		{ dateFrom: new db.Date('2017-02-02'), dateTo: new db.Date('2017-02-02') },
		{ dateFrom: new db.Date('2017-02-03'), dateTo: new db.Date('2017-02-03') }
	];
	compare(ranges, expectedRanges, a);

	mode   = 'weekly';
	ranges = t(dateFrom, dateTo, mode);
	expectedRanges = [
		{ dateFrom: new db.Date('2017-02-01'), dateTo: new db.Date('2017-02-03') }
	];
	compare(ranges, expectedRanges, a);
	mode   = 'monthly';
	compare(ranges, expectedRanges, a);
	mode   = 'yearly';
	compare(ranges, expectedRanges, a);

	dateFrom = new db.Date('2017-02-01');
	dateTo   = new db.Date('2017-02-15');
	mode     = 'weekly';
	ranges = t(dateFrom, dateTo, mode);
	expectedRanges = [
		{ dateFrom: new db.Date('2017-02-01'), dateTo: new db.Date('2017-02-05') },
		{ dateFrom: new db.Date('2017-02-06'), dateTo: new db.Date('2017-02-12') },
		{ dateFrom: new db.Date('2017-02-13'), dateTo: new db.Date('2017-02-15') }
	];
	compare(ranges, expectedRanges, a);

	dateFrom = new db.Date('2016-02-15');
	dateTo   = new db.Date('2016-05-03');
	mode     = 'monthly';
	ranges = t(dateFrom, dateTo, mode);
	expectedRanges = [
		{ dateFrom: new db.Date('2016-02-15'), dateTo: new db.Date('2016-02-29') },
		{ dateFrom: new db.Date('2016-03-01'), dateTo: new db.Date('2016-03-31') },
		{ dateFrom: new db.Date('2016-04-01'), dateTo: new db.Date('2016-04-30') },
		{ dateFrom: new db.Date('2016-05-01'), dateTo: new db.Date('2016-05-03') }
	];
	compare(ranges, expectedRanges, a);

	dateFrom = new db.Date('2015-02-15');
	dateTo   = new db.Date('2017-02-03');
	mode     = 'yearly';
	ranges = t(dateFrom, dateTo, mode);
	expectedRanges = [
		{ dateFrom: new db.Date('2015-02-15'), dateTo: new db.Date('2015-12-31') },
		{ dateFrom: new db.Date('2016-01-01'), dateTo: new db.Date('2016-12-31') },
		{ dateFrom: new db.Date('2017-01-01'), dateTo: new db.Date('2017-02-03') }
	];
	compare(ranges, expectedRanges, a);
};
