'use strict';

var aFrom = require('es5-ext/array/from')
  , Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , MultipleProcess = t(db)

	  , process = new MultipleProcess();

	db.Object.prototype.define('isApplicable', { type: db.Boolean });
	process.map.defineProperties({
		a: { nested: true },
		b: { nested: true },
		c: { nested: true }
	});
	process.map.a.isApplicable = true;
	a.deep(aFrom(process.applicable), [process.map.a]);
	process.map.c.isApplicable = true;
	a.deep(aFrom(process.applicable), [process.map.a, process.map.c]);
};
