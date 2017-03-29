'use strict';

var db             = require('../db')
  , toDateTimeInTz = require('./to-date-time-in-time-zone')
  , isDayOff       = require('../server/utils/is-day-off');

var getTimeInMs = function (hours, minutes) {
	return (hours * 3600000) + (minutes * 60000);
};

module.exports = function (startStamp, endStamp) {
	var startDateTime = toDateTimeInTz(new Date(startStamp), db.timeZone)
	  , endDateTime   = toDateTimeInTz(new Date(endStamp), db.timeZone)
	  , currentDate, processingTime = 0, startDate, endDate, workingHours
	  , startTimeMs, endTimeMs, startTimeThresholdMs, endTimeThresholdMs
	  , workTimePerDay;
	workingHours   = (db.globalPrimitives && db.globalPrimitives.workingHours);
	if (endStamp < startStamp) {
		throw new Error('Looks like file was processed before it was sent... check your params');
	}
	if (!workingHours) {
		throw new Error('No working hours defined');
	}

	startDate = new db.Date(startDateTime.getFullYear(), startDateTime.getMonth(),
		startDateTime.getDate());
	endDate   = new db.Date(endDateTime.getFullYear(), endDateTime.getMonth(), endDateTime.getDate());

	startTimeThresholdMs = getTimeInMs(workingHours.start.hours, workingHours.start.minutes);
	endTimeThresholdMs   = getTimeInMs(workingHours.end.hours, workingHours.end.minutes);
	startTimeMs = Math.max(getTimeInMs(startDateTime.getHours(),
		startDateTime.getMinutes()), startTimeThresholdMs);

	if (startTimeMs > endTimeThresholdMs) {
		startTimeMs = null;
	}

	workTimePerDay = endTimeThresholdMs - startTimeThresholdMs;

	endTimeMs = Math.min(getTimeInMs(endDateTime.getHours(), endDateTime.getMinutes()),
		endTimeThresholdMs);

	if (endTimeMs < startTimeThresholdMs) {
		endTimeMs = null;
	}

	// if processing within same day
	if (startDate.getTime() === endDate.getTime()) {
		if (isDayOff(startDate)) return 0;
		if (startTimeMs == null || endTimeMs == null) return 0;
		return endTimeMs - startTimeMs;
	}
	if (!isDayOff(startDate) && startTimeMs != null) {
		processingTime += (endTimeThresholdMs - startTimeMs);
	}
	currentDate = new db.Date(startDate.getTime());
	currentDate.setUTCDate(currentDate.getUTCDate() + 1);
	while (currentDate < endDate) {
		if (!isDayOff(currentDate)) {
			processingTime += workTimePerDay;
		}
		currentDate.setUTCDate(currentDate.getUTCDate() + 1);
	}
	if (!isDayOff(endDate) && endTimeMs != null) {
		processingTime += (endTimeMs - startTimeThresholdMs);
	}

	return processingTime < 0 ? 0 : processingTime;
};
