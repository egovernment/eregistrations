'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database();
	t(db);
	db.statistics.set('elo', '12');
	a(db.statistics.elo, '12');
};
