/**
 * Tracks processing steps status changes and updates processingHolidaysTime and
 * correctionTime props.
 * This is needed to calculate how long given processingStep was processed.
 */

'use strict';

var resolveProcessingStepFullPath = require('../../utils/resolve-processing-step-full-path')
  , serializeValue                = require('dbjs/_setup/serialize/value')
  , unserializeValue              = require('dbjs/_setup/unserialize/value')
  , capitalize                    = require('es5-ext/string/#/capitalize')
  , db                            = require('../../db')
  , Duration                      = require('duration')
  , toDateTimeInTz                = require('../../utils/to-date-time-in-time-zone')
  , isDayOff                      = require('../utils/is-day-off');

var getHolidaysProcessingTime = function (startStamp, endStamp) {
	var startDateTime = toDateTimeInTz(new Date(startStamp), db.timeZone)
	  , endDateTime   = toDateTimeInTz(new Date(endStamp), db.timeZone)
	  , startDateEndTime, currentDate, holidaysProcessingTime = 0, startDate, endDate;

	startDate = new db.Date(startDateTime.getFullYear(), startDateTime.getMonth(),
		startDateTime.getDate());
	endDate   = new db.Date(endDateTime.getFullYear(), endDateTime.getMonth(), endDateTime.getDate());
	if (startDate.getTime() === endDate.getTime()) {
		return 0;
	}
	if (isDayOff(startDate)) {
		startDateEndTime = new db.Date(startDate.getTime());
		startDateEndTime.setHours(23, 59, 59, 1000);
		holidaysProcessingTime += new Duration(startDateTime, startDateEndTime).milliseconds;
	}
	currentDate = new db.Date(startDate.getTime());
	currentDate.setUTCDate(currentDate.getUTCDate() + 1);
	while (currentDate < endDate) {
		if (isDayOff(currentDate)) {
			holidaysProcessingTime += 86400000;
		}
		currentDate.setUTCDate(currentDate.getUTCDate() + 1);
	}

	return holidaysProcessingTime;
};

module.exports = function (driver, processingStepsMeta) {
	Object.keys(processingStepsMeta).forEach(function (stepMetaKey) {
		var stepPath, storages;
		stepPath = 'processingSteps/map/' + resolveProcessingStepFullPath(stepMetaKey);
		storages = processingStepsMeta[stepMetaKey]._services;
		if (!storages) throw new Error("Storages must be set");
		storages = storages.map(function (storageName) {
			return driver.getStorage('businessProcess' + capitalize.call(storageName));
		});
		storages.forEach(function (storage) {
			storage.on('key:' + stepPath + '/status', function (event) {
				var status, oldStatus, correctionTimePath
				  , processingHolidaysTimePath, processingHolidaysTime;

				if (event.type !== 'computed' || !event.old) return;
				status    = unserializeValue(event.data.value);
				oldStatus = unserializeValue(event.old.value);
				// We ignore such cases, they may happen when direct overwrites computed
				if (status === oldStatus) return;
				if (status === 'approved' || status === 'rejected' || status === 'paused') {
					processingHolidaysTimePath = event.ownerId + '/' + stepPath + '/processingHolidaysTime';
					processingHolidaysTime =
						getHolidaysProcessingTime(event.old.stamp / 1000, event.data.stamp / 1000);
					if (processingHolidaysTime) {
						storage.get(processingHolidaysTimePath)(function (data) {
							var currentValue = 0;
							if (data && (data.value[0] === '2')) {
								currentValue = unserializeValue(data.value);
							}
							return storage.store(processingHolidaysTimePath,
								serializeValue(currentValue + processingHolidaysTime));
						}).done();
					}
					return;
				}
				if (oldStatus === 'sentBack') {
					correctionTimePath = event.ownerId + '/' + stepPath + '/correctionTime';
					storage.get(correctionTimePath)(function (data) {
						var currentValue = 0;
						if (data && (data.value[0] === '2')) {
							currentValue = unserializeValue(data.value);
						}
						return storage.store(correctionTimePath,
							serializeValue(currentValue + ((event.data.stamp - event.old.stamp) / 1000)));
					}).done();
				}
			});
		});
	});
};
