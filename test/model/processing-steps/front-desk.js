'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , Step = t(db)
	  , frontDeskStep = new Step();

	a(frontDeskStep.institution, null);
};
