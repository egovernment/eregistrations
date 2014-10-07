'use strict';

var forEach       = require('es5-ext/object/for-each')
  , isObject      = require('es5-ext/object/is-object')
  , customError   = require('es5-ext/error')
  , toPosInteger  = require('es5-ext/number/to-pos-integer')
  , validArray    = require('es5-ext/array/valid-array')
  , validValue    = require('es5-ext/object/valid-value')
  , dbjsSerialize = require('dbjs/_setup/serialize/value')
  , genId         = require('time-uuid')
  , now           = require('microtime-x')
  , options, serializeProperty, serializeObject, updatesArray
  , generateSection, generateObject, generateProperty, generateMultiple;

module.exports = function (map/*, options */) {
	var count = 1;
	options = Object(arguments[1]);
	if (options.count) {
		count = toPosInteger(options.count);
		if (!count) {
			throw customError("count parameter must be a positive integer",
				"WRONG_PARAM_HOW_MANY", { statusCode: 401 });
		}
	}
	updatesArray = [];
	while (count--) {
		generateObject(map);
	}
	return updatesArray;
};

generateSection = function (map, objId) {
	validArray(map);
	map.forEach(function (section) {
		forEach(section, function (item, key) {
			if (item.id) {
				generateObject(item);
			} else {
				generateProperty(item, key, objId);
			}
		});
	});
};

generateObject = function (map) {
	validValue(map.id);
	generateSection(map.value, serializeObject(map.id));
};

generateProperty = function (item, key, objId) {
	if (item.multiple) {
		generateMultiple(item, key, objId);
	} else {
		serializeProperty(objId, key, item);
	}
};

generateMultiple = function (item, key, objId) {
	var idForUpdate, min, value;
	if (item.get || Array.isArray(item.value)) { //primitive
		value = item.value;
		if (item.get) {
			value = item.get();
		}
		validArray(value);
		value.forEach(function (v) {
			serializeProperty(objId, key + '*' + dbjsSerialize(v), v);
		});
		return;
	}
	min = Number(item.min) || 1;
	while (min--) {
		idForUpdate = serializeObject(item.value.id);
		serializeProperty(objId, key + '*' + idForUpdate, true);
		generateSection(item.value.value, idForUpdate);
	}
};

serializeObject = function (prototypeId) {
	var itemForUpdate, id;
	id = genId();
	itemForUpdate = {
		id: '7' + id,
		value: prototypeId,
		stamp: now()
	};
	updatesArray.push(itemForUpdate);
	return itemForUpdate.id;
};

serializeProperty = function (objId, key, item) {
	var itemForUpdate, value;
	value = item;
	if (isObject(item)) {
		if (item.get) {
			value = item.get();
		} else {
			value = item.value;
		}
	}
	itemForUpdate = {
		id: objId + '/' + key,
		value: dbjsSerialize(value),
		stamp: now()
	};
	updatesArray.push(itemForUpdate);
};
