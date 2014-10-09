'use strict';

var isObject      = require('es5-ext/object/is-object')
  , customError   = require('es5-ext/error')
  , toPosInteger  = require('es5-ext/number/to-pos-integer')
  , validArray    = require('es5-ext/array/valid-array')
  , validValue    = require('es5-ext/object/valid-value')
  , dbjsSerialize = require('dbjs/_setup/serialize/value')
  , genId         = require('time-uuid')
  , now           = require('time-uuid/time')
  , options, serializeProperty, serializeObject, updatesArray
  , generateObject, generateProperty, generateMultiple;

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

generateObject = function (map) {
	var itemForUpdate, opts, stamp;
	validValue(map.id);
	itemForUpdate = serializeObject(map.id);
	stamp = itemForUpdate.stamp;
	validArray(map.value);
	map.value.forEach(function (section) {
		section.forEach(function (item) {
			stamp = now.increment();
			opts = { stamp: stamp };
			generateProperty(item, item.sKey, itemForUpdate.id, opts);
		});
		stamp = now();
	});

	return { id: itemForUpdate.id, stamp: stamp };
};

generateProperty = function (item, key, objId/*, options */) {
	var options = Object(arguments[3]), itemForUpdate, value;
	if (item.multiple) {
		generateMultiple(item, key, objId, options);
	} else {
		if (isObject(item.value)) {
			itemForUpdate = generateObject(item.value);
			serializeProperty(objId, key, '7' + itemForUpdate.id, options);
			return;
		}
		value = item.get ? dbjsSerialize(item.get()) : dbjsSerialize(item.value);
		serializeProperty(objId, key, value, options);
	}
};

generateMultiple = function (item, key, objId/*, options */) {
	var min, value, options, itemForUpdate;
	options = Object(arguments[3]);
	min = Number(item.min) || 1;
	if (item.get || Array.isArray(item.value)) { //primitive
		value = item.value;
		if (item.get) {
			while (min--) {
				value = item.get();
				serializeProperty(objId, key + '*' + value, dbjsSerialize(value), options);
				if (options.stamp) {
					options.stamp = now.increment();
				}
			}
			return;
		}
		validArray(value);
		value.forEach(function (v) {
			serializeProperty(objId, key + '*' + v, dbjsSerialize(v), options);
			if (options.stamp) {
				options.stamp = now.increment();
			}
		});
		return;
	}
	while (min--) {
		itemForUpdate = generateObject(item.value);
		serializeProperty(objId, key + '*' + itemForUpdate.id, '11', { stamp: itemForUpdate.stamp });
	}
};

serializeObject = function (prototypeId/*,options */) {
	var itemForUpdate, id, options;
	options = Object(arguments[1]);
	id = genId();
	itemForUpdate = {
		id: id,
		value: '7' + prototypeId,
		stamp: options.stamp || now()
	};
	updatesArray.push(itemForUpdate);
	return itemForUpdate;
};

serializeProperty = function (objId, key, value/*, options */) {
	var itemForUpdate, options;
	options = Object(arguments[3]);
	itemForUpdate = {
		id: objId + '/' + key,
		value: value,
		stamp: options.stamp || now()
	};
	updatesArray.push(itemForUpdate);
};
