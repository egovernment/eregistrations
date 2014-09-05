'use strict';

var Database    = require('dbjs')
  , DbjsEvent   = require('dbjs/_setup/event')
  , validDbjs   = require('dbjs/valid-dbjs')
  , isGetter    = require('dbjs/_setup/utils/is-getter')
  , customError = require('es5-ext/error/custom')
  , defineUser  = require('mano-auth/model/user')

  , getPrototypeOf = Object.getPrototypeOf
  , migrateType, migrateProperty, migrateObject;

migrateType = function (type, targetDatabase) {
	var prototype, sourceEvent, targetType;
	targetType = targetDatabase.objects.getById(type.__id__);
	if (targetType) return targetType;
	prototype = migrateType(getPrototypeOf(type), targetDatabase);
	sourceEvent = type._lastOwnEvent_;
	new DbjsEvent(targetType = targetDatabase.objects.unserialize(type.__id__, prototype),
		prototype, (sourceEvent && sourceEvent.stamp) || 0); //jslint: ignore
	migrateObject(type, targetDatabase);
	migrateObject(type.prototype, targetDatabase);
	return targetType;
};

migrateProperty = function (sourceDesc, targetDatabase) {
	var hasInformation = false, value, sourceEvent;
	if (targetDatabase.objects.getById(sourceDesc.__id__)) return hasInformation;
	if (migrateProperty(getPrototypeOf(sourceDesc), targetDatabase)) hasInformation = true;
	sourceDesc._forEachOwnDescriptor_(function (subDesc) {
		var key = subDesc.key, sourceEvent, value;
		hasInformation = true;
		if (key === 'statsBase') return;
		if (key === 'type') migrateType(sourceDesc.type, targetDatabase);
		sourceEvent = subDesc._lastOwnEvent_;
		value = sourceDesc[key];
		if (value instanceof sourceDesc.database.Base) {
			value = targetDatabase.objects.getById(value.__id__);
			if (!value) {
				throw new TypeError("Could not migrate object of id: ", sourceDesc[key].__id__);
			}
		}
		new DbjsEvent(targetDatabase.objects.unserialize(subDesc.__id__), value,
			(sourceEvent && sourceEvent.stamp) || 0); //jslint: ignore
	});
	if (!sourceDesc.hasOwnProperty('_value_') || (sourceDesc._value_ === undefined)) {
		return hasInformation;
	}
	value = sourceDesc._value_;
	if (sourceDesc.master instanceof sourceDesc.database.Object) {
		if (isGetter(value)) {
			if (!sourceDesc.hasOwnProperty('statsBase')) return hasInformation;
			value = sourceDesc.statsBase;
			if (value == null) return hasInformation;
		}
	}
	sourceEvent = sourceDesc._lastOwnEvent_;
	new DbjsEvent(targetDatabase.objects.unserialize(sourceDesc.__valueId__), value,
		(sourceEvent && sourceEvent.stamp) || 0); //jslint: ignore
	return true;
};

migrateObject = function (source, targetDatabase) {
	var isFullCopy = !(source.master instanceof source.database.Object), sKey, desc, anyDefined;

	for (sKey in source.__descriptors__) {
		desc = source.__descriptors__[sKey];
		if (desc.nested) {
			if (migrateObject(source.get(desc.key), targetDatabase)) {
				anyDefined = true;
				migrateProperty(desc, targetDatabase);
			}
			if (!isFullCopy) continue;
		}
		if (desc.object !== source) continue;
		if (!isFullCopy && !desc.hasOwnProperty('statsBase')) continue;
		if (migrateProperty(desc, targetDatabase)) anyDefined = true;
	}
	return anyDefined;
};

module.exports = function (mainDb) {
	var statsDb;
	validDbjs(mainDb);
	if (!mainDb.User) throw customError('User type not found on source database', 'NO_USER_IN_DB');

	statsDb = new Database();
	defineUser(statsDb);

	migrateObject(mainDb.User, statsDb);
	migrateObject(mainDb.User.prototype, statsDb);
	return statsDb;
};
