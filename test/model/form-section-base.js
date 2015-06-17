'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSectionBase = t(db)
	  , section = new FormSectionBase({ actionUrl: 'test' });

	a(section.actionUrl, 'test');
};
