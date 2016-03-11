'use strict';

var db = require('mano').db;

module.exports = function (date) {
	if (!date) return;
	return String(new db.DateTime(Math.round(date / 1000)));
};
