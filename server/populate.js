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
  , generateSection, generateObject, generateProperty;

module.exports = function (map/*, options */) {
	var count = 1;
	options = Object(arguments[1]);
	if (options.count) {
		count = toPosInteger(options.count);
		if (!count) {
			throw customError("hawMany parameter must be a positive integer",
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
	var idForUpdate;
	idForUpdate = objId || serializeObject(map.id).id;
	validArray(map);
	map.forEach(function (section) {
		forEach(section, function (item, key) {
			if (item.id) {
				generateObject(item);
			} else {
				generateProperty(item, key, idForUpdate);
			}
		});
	});
};

generateObject = function (map, objId) {
	var idForUpdate;
	validValue(map.id);
	idForUpdate = objId || serializeObject(map.id).id;
	generateSection(map.value, idForUpdate);
};

generateProperty = function (item, key, objId) {
	var idForUpdate;
	if (item.multiple) {
		validArray(item.value);
		item.value.forEach(function (multipleItem, multipleItemKey) {
			if (multipleItem.id) {
				idForUpdate = serializeObject(multipleItem.id).id;
				serializeProperty(objId, key + '*' + idForUpdate, true);
				generateSection(multipleItem.value, idForUpdate);
			} else {
				serializeProperty(objId, key + '*' + multipleItemKey, multipleItem);
			}
		});
	} else {
		serializeProperty(objId, key, item);
	}
};

serializeObject = function (prototypeId) {
	var itemForUpdate;
	itemForUpdate = {
		id: '7' + genId(),
		value: prototypeId,
		stamp: now()
	};
	updatesArray.push(itemForUpdate);
	return itemForUpdate;
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
