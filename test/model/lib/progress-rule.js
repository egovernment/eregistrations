'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , ProgressRule = t(db)

	  , progressRule = new ProgressRule();

	a(progressRule.getDescriptor('weight').type, db.UInteger);
	a(progressRule.getDescriptor('progress').type, db.Percentage);
	a(progressRule.getDescriptor('message').type, db.String);
	a(progressRule.isApplicable, true);
	a(progressRule.isValid, false);
};
