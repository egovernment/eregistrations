'use strict';

var Database       = require('dbjs')
  , defineDbjsDate = require('dbjs-ext/date-time/date');

module.exports = function (t, a) {
	var db = new Database(), date;
	defineDbjsDate(db);
	date = t(db, '2015');
	a(Number(date), Number(new db.Date('2015')));
	date = t(db, '2015-07-20');
	a(Number(date), Number(new db.Date(2015, 6, 20)));
};
