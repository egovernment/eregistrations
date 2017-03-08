'use strict';

var db = require('../db');

module.exports = function (date) {
	if (!(date instanceof db.Date)) throw new Error("copyDbDate expects db date!");
	return new db.Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};
