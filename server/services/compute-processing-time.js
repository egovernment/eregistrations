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
  , isDayOff                      = require('../utils/is-day-off')
  , Set                           = require('es6-set')
  , getData                       = require('../business-process-query/get-data')
  , queryData;

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

var storeTime = function (storage, path, time) {
	return storage.get(path)(function (data) {
		var currentValue = 0;
		if (data && (data.value[0] === '2')) {
			currentValue = unserializeValue(data.value);
		}
		return storage.store(path, serializeValue(currentValue + time));
	});
};

var getOnIsClosed = function (storage) {
	return function (event) {
		var nuValue, processingHolidaysTimePath, processingHolidaysTime;

		if (event.type !== 'direct') return;
		nuValue  = unserializeValue(event.data.value);
		if (nuValue !== true) return;
		storage.get(event.ownerId + '/isSubmitted')(function (isSubmitted) {
			processingHolidaysTimePath = event.ownerId + '/processingHolidaysTime';
			processingHolidaysTime =
				getHolidaysProcessingTime(isSubmitted.stamp / 1000, event.data.stamp / 1000);
			if (processingHolidaysTime) {
				return storeTime(storage, processingHolidaysTimePath, processingHolidaysTime);
			}
		}).done();
	};
};

var getOnIsSentBack = function (storage) {
	return function (event) {
		var nuValue, oldValue, correctionTimePath, correctionTime;

		if (event.type !== 'direct' || !event.old) return;
		nuValue  = unserializeValue(event.data.value);
		oldValue = unserializeValue(event.old.value);
		// We're only interested in cases when isSentBack is changed from true to undefined
		if (!(oldValue === true && !nuValue)) return;
		correctionTimePath = event.ownerId + '/correctionTime';
		correctionTime = (event.data.stamp - event.old.stamp) / 1000;
		if (correctionTime) {
			storeTime(storage, correctionTimePath, correctionTime).done();
		}
		// We need to handle step statuses as well
		queryData(function (data) {
			if (!data || !data.steps) return;
			data.steps.forEach(function (stepData, stepName) {
				var currentData, correctionPath, correctionTime;
				if (!stepData.has(event.ownerId)) return;
				currentData = stepData.get(event.ownerId);
				if (currentData.status !== 'sentBack') return;
				if (!currentData.statusStamp) return;
				correctionPath = event.ownerId + '/' + currentData.stepFullPath + '/correctionTime';

				//below should never happen
				if (event.data.stamp - currentData.statusStamp < 0) {
					return;
				}

				correctionTime = (event.data.stamp - currentData.statusStamp) / 1000;
				storeTime(storage, correctionPath, correctionTime).done();
			});
		}).done();
	};
};

module.exports = function (driver, processingStepsMeta) {
	var allStorages = new Set();
	queryData = getData(driver, processingStepsMeta);
	Object.keys(processingStepsMeta).forEach(function (stepMetaKey) {
		var stepPath, storages;
		stepPath = 'processingSteps/map/' + resolveProcessingStepFullPath(stepMetaKey);
		storages = processingStepsMeta[stepMetaKey]._services;
		if (!storages) throw new Error("Storages must be set");
		storages = storages.map(function (storageName) {
			return driver.getStorage('businessProcess' + capitalize.call(storageName));
		});
		storages.forEach(function (storage) {
			allStorages.add(storage);
			storage.on('key:' + stepPath + '/status', function (event) {
				var status, oldStatus, processingHolidaysTimePath, processingHolidaysTime
				  , nonProcessingTimePath, nonProcessingTime;

				if (event.type !== 'computed' || !event.old) return;
				status    = unserializeValue(event.data.value);
				oldStatus = unserializeValue(event.old.value);

				// We ignore such cases, they may happen when direct overwrites computed
				if (status === oldStatus) return;
				if (status === 'approved' || status === 'rejected'
						|| status === 'paused' || status === 'redelegated') {
					processingHolidaysTimePath = event.ownerId + '/' + stepPath + '/processingHolidaysTime';
					processingHolidaysTime =
						getHolidaysProcessingTime(event.old.stamp / 1000, event.data.stamp / 1000);
					if (processingHolidaysTime) {
						storeTime(storage, processingHolidaysTimePath, processingHolidaysTime).done();
					}
				} else if (status === 'pending') {
					nonProcessingTimePath = event.ownerId + '/' + stepPath + '/nonProcessingTime';
					nonProcessingTime = ((event.data.stamp - event.old.stamp) / 1000);
					if (nonProcessingTime) {
						storeTime(storage, nonProcessingTimePath, nonProcessingTime).done();
					}
				}
			});
		});
	});
	allStorages.forEach(function (storage) {
		var onIsClosed = getOnIsClosed(storage), onIsSentBack = getOnIsSentBack(storage);
		storage.on('key:isApproved', onIsClosed);
		storage.on('key:isRejected', onIsClosed);
		storage.on('key:isSentBack', onIsSentBack);
	});
};
