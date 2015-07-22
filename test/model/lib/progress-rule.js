'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , ProgressRule = t(db)

	  , processRule = new ProgressRule();

	a(processRule.getDescriptor('weight').type, db.UInteger);
	a(processRule.getDescriptor('progress').type, db.Percentage);
	a(processRule.getDescriptor('warning').type, db.String);
	a(processRule.isApplicable, true);
	a(processRule.isValid, false);
};
