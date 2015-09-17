'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database();
	t(db);
	db.views.set('elo', '12');
	a(db.views.elo, '12');
};
