'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database();
	t(db);

	a(db.Currency.normalize(undefined), null);
	a(db.Currency.normalize(null), 0);
	a(db.Currency.normalize(false), 0);
	a(db.Currency.normalize({}), null);
	a(db.Currency.normalize('false'), null);
	a(db.Currency.normalize('0'), 0);
	a(db.Currency.normalize(1), 1);
	a(db.Currency.normalize(1.1), 1.1);
	a(db.Currency.normalize(1.1, { step: 1 }), 1);
	a(db.Currency.normalize(1.1, { step: 0.1 }), 1.1);
	a(db.Currency.normalize(1.1, { step: 0.01 }), 1.1);
	a(db.Currency.normalize(113.99, { step: 0.01 }), 113.99);
	a(db.Currency.normalize(113.991, { step: 0.01 }), 113.99);
	a(db.Currency.normalize(113.9949, { step: 0.01 }), 113.99);
	a(db.Currency.normalize(113.995, { step: 0.01 }), 114);
	a(db.Currency.normalize(113.999, { step: 0.01 }), 114);
	a(db.Currency.normalize(2, { min: 1 }), 2);
	a(db.Currency.normalize(1, { min: 2 }), null);
	a(db.Currency.normalize(1, { max: 2 }), 1);
	a(db.Currency.normalize(2, { max: 1 }), null);
};
