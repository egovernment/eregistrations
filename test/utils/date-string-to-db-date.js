'use strict';

var Database = require('dbjs')
  , DbjsDate = require('dbjs-ext/date-time/date');

module.exports = function (t, a) {
	var db = new Database(), date;
	DbjsDate(db); //jslint: ignore
	date = t(db, '2015');
	a(Number(date), Number(new db.Date('2015')));
	date = t(db, '2015-07-20');
	a(Number(date), Number(new db.Date(2015, 6, 20)));
};
