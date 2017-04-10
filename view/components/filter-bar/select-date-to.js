'use strict';

var db       = require('../../../db')
  , location = require('mano/lib/client/location');

module.exports = function (/* opts */) {
	var opts = Object(arguments[0])
	  , name = opts.name || 'dateTo';
	return input({
		id: opts.id || 'date-to-input',
		type: opts.type || 'date',
		name: name,
		value: location.query.get(name).map(function (dateTo) {
			if (dateTo) return dateTo;
			var now = new db.Date(), defaultDate;
			if (opts.date) {
				if (typeof opts.date === 'function') {
					return opts.date();
				}
				return opts.date;
			}
			defaultDate = new db.Date(now.getUTCFullYear(), now.getUTCMonth(),
				now.getUTCDate());
			return defaultDate.toISOString().slice(0, 10);
		})
	});
};
