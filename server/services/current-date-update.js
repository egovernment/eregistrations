'use strict';

var ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , serializeValue = require('dbjs/_setup/serialize/value')
  , ensureStorage  = require('dbjs-persistence/ensure-storage')
  , db             = require('mano').db
  , debug          = require('debug-ext')('current-date-update')
  , time           = require('time')

  , key = 'globalPrimitives/currentDate';

var getNextScheduleTimeout = function (tz) {
	var now                = (new time.Date()).setTimezone(tz)
	  , next_schedule_date = (new time.Date(now.getFullYear(), now.getMonth(),
				now.getDate() + 1, tz));

	return next_schedule_date - now;
};
/**
 * Updates currentDate once per 24 hours
 *
 * @param storage - the storage containing globalPrimitives/currentDate entry
 * @param tz      - Timezone as defined in time module
 */
module.exports = function (storage, tz) {
	ensureStorage(storage);
	ensureString(tz);
	var updateCallback = function () {
		var currentDate = db.Date((new time.Date()).setTimezone(tz));

		storage.get(key).then(function (data) {
			if (!data || data.value !== serializeValue(currentDate)) {
				debug('to %s', currentDate.toISOString().slice(0, 10));
				return storage.store(key, serializeValue(currentDate));
			}
		}).done();

		setTimeout(updateCallback, getNextScheduleTimeout(tz));
	};

// Update once on start
	updateCallback();
};
