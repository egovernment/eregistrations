'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database();
	t(db);
	db.view.set('elo', '12');
	a(db.view.elo, '12');
};
