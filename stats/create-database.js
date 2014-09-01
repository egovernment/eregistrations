'use strict';

var Database      = require('dbjs')
  , validDbjs     = require('dbjs/valid-dbjs')
  , validDbjsType = require('dbjs/valid-dbjs-type')
  , isGetter      = require('dbjs/_setup/utils/is-getter')
  , customError   = require('es5-ext/error/custom')
  , copy          = require('es5-ext/object/copy')
  , manoAuthUser  = require('mano-auth/model/user')
  , statsDb, addMissingTypes, migrateObject, setupDescriptor, srcDb;

addMissingTypes = function (sourceType) {
	if (!validDbjsType(sourceType)) {
		return;
	}
	if (!statsDb[sourceType.__id__]) {
		addMissingTypes(Object.getPrototypeOf(sourceType), sourceType);
		statsDb[Object.getPrototypeOf(sourceType).__id__].extend(sourceType.__id__);
		migrateObject(sourceType, statsDb[sourceType.__id__], true);
		migrateObject(sourceType.prototype, statsDb[sourceType.__id__].prototype);
	}
};

setupDescriptor = function (object, descProp) {
	var newDescProp, defaultValue, descKey;
	descKey        = descProp.key;
	defaultValue   = null;
	if (descProp._value_ != null) {
		if (isGetter(descProp) || srcDb.Object.prototype.isPrototypeOf(descProp.master)) {
			if (descProp.statsBase != null) {
				defaultValue = descProp.statsBase;
			}
		} else {
			defaultValue = descProp._value_;
		}
	}
	newDescProp       = copy(descProp);
	addMissingTypes(descProp.type);
	newDescProp.type  = statsDb[descProp.type.__id__];
	if (defaultValue != null) {
		newDescProp.value = defaultValue;
	}
	object.define(descKey, newDescProp);
};

migrateObject = function (sourceInstance, statsInstance, copyAll) {
	sourceInstance._forEachOwnDescriptor_(function (descProp) {
		if (!descProp.hasOwnProperty('statsBase') && !descProp.nested && !copyAll) {
			return;
		}
		setupDescriptor(statsInstance, descProp);
	});
};

module.exports = function (sourceDb) {
	validDbjs(sourceDb);
	statsDb = new Database();
	statsDb.User = manoAuthUser(statsDb);
	if (!sourceDb.User || !sourceDb.User.prototype) {
		throw customError('Stats createDatabase expects db with defined User.prototype',
			'NO_USER_PROTOTYPE_IN_DB');
	}
	srcDb = sourceDb;
	migrateObject(srcDb.User, statsDb.User, true);
	migrateObject(srcDb.User.prototype, statsDb.User.prototype);

	return statsDb;
};
