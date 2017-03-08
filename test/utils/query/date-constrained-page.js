'use strict';

var db             = require('../../../db')
  , defineDbjsDate = require('dbjs-ext/date-time/date');

module.exports = function (t, a) {
	var query;
	defineDbjsDate(db);
	query = { dateFrom: new db.Date('2016-01-01'), dateTo: new db.Date('2017-02-01'), mode: 'daily' };

	a(t.ensure(null, query), 1);
	a(t.ensure('2', query), 2);
};
