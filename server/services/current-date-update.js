'use strict';

var dateCopy       = require('es5-ext/date/#/copy')
  , floorDate      = require('es5-ext/date/#/floor-day')
  , ensureString   = require('es5-ext/object/validate-stringifiable-value')
  , serializeValue = require('dbjs/_setup/serialize/value')
  , ensureStorage  = require('dbjs-persistence/ensure-storage')
  , debug          = require('debug-ext')('current-date-update')
  , toDateInTz     = require('../../utils/to-date-in-time-zone')
  , toDateTimeInTz = require('../../utils/to-date-time-in-time-zone')

  , key = 'globalPrimitives/currentDate';

var getNextScheduleTimeout = function (tz) {
	var now = toDateTimeInTz(new Date(), tz)
	  , restartAt = dateCopy.call(now);

	// Set proper restartAt time (upcoming midnight)
	restartAt.setDate(restartAt.getDate() + 1);
	floorDate.call(restartAt);

	return restartAt - now;
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
		var currentDate = toDateInTz(new Date(), tz);

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
