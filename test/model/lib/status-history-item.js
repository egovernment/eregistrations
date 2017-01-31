'use strict';

var Database = require('dbjs');

module.exports = function (t, a) {
	var db = new Database()
	  , StatusHistoryItem = t(db)

	  , statusHistoryItem = new StatusHistoryItem();

	statusHistoryItem.status = 'approved';
	a(statusHistoryItem.status, 'approved');
};
