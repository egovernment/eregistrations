'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db               = new Database()
	  , globalPrimitives = t(db);

	a(globalPrimitives.hasOwnPropertyDefined('holidays'), true);
};
