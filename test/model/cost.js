'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , Cost = t(db)
	  , cost = new Cost({ amount: '10' });

	a(cost.amount, 10);
};
