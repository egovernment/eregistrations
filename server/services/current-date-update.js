'use strict';

var db             = require('mano').db
  , storage        = require('mano').dbDriver.getStorage('object')
  , serializeValue = require('dbjs/_setup/serialize/value')
  , debug          = require('debug-ext')('current-date-update')
  , time           = require('time')
  , key            = 'globalPrimitives/currentDate';

var getNextScheduleTimeout = function (tz) {
	var now                = (new time.Date()).setTimezone(tz)
	  , next_schedule_date = (new time.Date(now.getFullYear(), now.getMonth(),
				now.getDate() + 1, tz));

	return next_schedule_date - now;
};

module.exports = function (tz) {
	var updateCallback = function () {
		var currentDate = db.Date((new time.Date()).setTimezone(tz));

		storage.get(key).then(function (data) {
			if (data.value !== serializeValue(currentDate)) {
				debug('to %s', currentDate.toISOString().slice(0, 10));
				return storage.store(key, serializeValue(currentDate));
			}
		}).done();

		setTimeout(updateCallback, getNextScheduleTimeout(tz));
	};

// Update once on start
	updateCallback();
};
