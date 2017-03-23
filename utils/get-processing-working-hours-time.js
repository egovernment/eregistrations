'use strict';

var db             = require('../db')
  , toDateTimeInTz = require('./to-date-time-in-time-zone')
  , isDayOff       = require('../server/utils/is-day-off');

module.exports = function (startStamp, endStamp) {
	var startDateTime = toDateTimeInTz(new Date(startStamp), db.timeZone)
	  , endDateTime   = toDateTimeInTz(new Date(endStamp), db.timeZone)
	  , currentDate, processingTime = 0, startDate, endDate, workingHours
	  , workTimePerDay;
	workingHours   = (db.globalPrimitives && db.globalPrimitives.workingHours);
	if (!workingHours) {
		throw new Error('No working hours defined');
	}
	workTimePerDay = (workingHours.end.hours - workingHours.start.hours) * 3600000;
	workTimePerDay += ((workingHours.end.minutes - workingHours.start.minutes) * 60000);

	startDate = new db.Date(startDateTime.getFullYear(), startDateTime.getMonth(),
		startDateTime.getDate());
	endDate   = new db.Date(endDateTime.getFullYear(), endDateTime.getMonth(), endDateTime.getDate());

	startDateTime.setHours(Math.max(startDateTime.getHours(), workingHours.start.hours));
	startDateTime.setMinutes(startDateTime.getHours() < workingHours.end.hours ?
			startDateTime.getMinutes() : workingHours.end.minutes);

	endDateTime.setHours(Math.min(endDateTime.getHours(), workingHours.end.hours));
	endDateTime.setMinutes(endDateTime.getHours() < workingHours.end.hours ?
			endDateTime.getMinutes() : workingHours.end.minutes);

	// if processing within same day
	if (startDate.getTime() === endDate.getTime()) {
		if (isDayOff(startDate)) return 0;
		// may happen if processing finished before work hours started
		if (endDateTime < startDateTime) return 0;
		return endDateTime - startDateTime;
	}
	if (!isDayOff(startDate)) {
		processingTime += (workingHours.end.hours - startDateTime.getHours()) * 3600000;
		processingTime += ((workingHours.end.minutes - startDateTime.getMinutes()) * 60000);
	}
	currentDate = new db.Date(startDate.getTime());
	currentDate.setUTCDate(currentDate.getUTCDate() + 1);
	while (currentDate < endDate) {
		if (!isDayOff(currentDate)) {
			processingTime += workTimePerDay;
		}
		currentDate.setUTCDate(currentDate.getUTCDate() + 1);
	}
	if (!isDayOff(endDate)) {
		if (endDateTime.getHours() < workingHours.start.hours) {
			processingTime += 0;
		} else if (endDateTime.getHours() === workingHours.start.hours &&
				workingHours.start.minutes > endDateTime.getMinutes()) {
			processingTime += 0;
		} else {
			processingTime += (endDateTime.getHours() - workingHours.start.hours) * 3600000;
			processingTime += ((endDateTime.getMinutes() - workingHours.start.minutes) * 60000);
		}
	}

	return processingTime;
};
