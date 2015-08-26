'use strict';

var db = require('mano').db;

module.exports = function (millisecTs) {
	if (!millisecTs) {
		return '';
	}
	return String(db.Date(millisecTs / 1000));
};
