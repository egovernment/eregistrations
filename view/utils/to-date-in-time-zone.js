'use strict';

var db = require('mano').db;

module.exports = function (date) {
	try {
		var res = new Date(date).toLocaleDateString('en', {
			timeZone: 'America/Guatemala',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		}).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

		if (res) {
			return new db.Date(res[3], res[1] - 1, res[2]);
		}
	} catch (ignore) {}

	return new db.Date(date);
};
