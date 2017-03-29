'use strict';

var db       = require('../../../db')
  , location = require('mano/lib/client/location');

module.exports = function (/* opts */) {
	var opts = Object(arguments[0]), name;
	name = opts.name || 'dateFrom';
	return input({
		id: opts.id || 'date-from-input',
		type: 'date',
		name: name,
		value: location.query.get(name).map(function (dateFrom) {
			if (dateFrom) return dateFrom;
			if (opts.date) {
				if (typeof opts.date === 'function') {
					return opts.date();
				}
				return opts.date;
			}
			var now = new db.Date(), defaultDate;
			defaultDate = new db.Date(now.getUTCFullYear(), now.setUTCMonth(0), now.setUTCDate(1));
			return defaultDate.toISOString().slice(0, 10);
		})
	});
};
