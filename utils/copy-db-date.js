'use strict';

var db = require('../db');

module.exports = function (date) {
	return new db.Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};
