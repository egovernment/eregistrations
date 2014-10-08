'use strict';

var forEach       = require('es5-ext/object/for-each')
  , isObject      = require('es5-ext/object/is-object')
  , customError   = require('es5-ext/error')
  , toPosInteger  = require('es5-ext/number/to-pos-integer')
  , validArray    = require('es5-ext/array/valid-array')
  , validValue    = require('es5-ext/object/valid-value')
  , assign        = require('es5-ext/object/assign')
  , dbjsSerialize = require('dbjs/_setup/serialize/value')
  , genId         = require('time-uuid')
  , now           = require('microtime-x')
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

generateObject = function (map/*, options */) {
	var options = Object(arguments[1]), itemForUpdate, opts, stamp;
	validValue(map.id);
	itemForUpdate = serializeObject(map.id, options);
	stamp = itemForUpdate.stamp;
	if (options && options.multiple && options.parentId && options.propKey) {
		serializeProperty(options.parentId, options.propKey + '*' + itemForUpdate.id,
			true, { stamp: stamp });
	}
	validArray(map.value);
	map.value.forEach(function (section) {
		opts = { stamp: stamp };
		forEach(section, function (item, key) {
			if (item.id) {
				generateObject(item, opts);
			} else {
				generateProperty(item, key, itemForUpdate.id, opts);
			}
		});
		stamp++;
	});
};

generateProperty = function (item, key, objId/*, options */) {
	var options = Object(arguments[3]);
	if (item.multiple) {
		generateMultiple(item, key, objId, options);
	} else {
		serializeProperty(objId, key, item, options);
	}
};

generateMultiple = function (item, key, objId/*, options */) {
	var min, value, options;
	options = Object(arguments[3]);
	if (item.get || Array.isArray(item.value)) { //primitive
		value = item.value;
		if (item.get) {
			value = item.get();
		}
		validArray(value);
		value.forEach(function (v) {
			serializeProperty(objId, key + '*' + dbjsSerialize(v), v, options);
		});
		return;
	}
	min = Number(item.min) || 1;
	while (min--) {
		generateObject(item.value, assign(options, { parentId: objId, propKey: key, multiple: true }));
	}
};

serializeObject = function (prototypeId/*,options */) {
	var itemForUpdate, id, options;
	options = Object(arguments[1]);
	id = genId();
	itemForUpdate = {
		id: '7' + id,
		value: prototypeId,
		stamp: options.stamp || now()
	};
	updatesArray.push(itemForUpdate);
	return itemForUpdate;
};

serializeProperty = function (objId, key, item/*, options */) {
	var itemForUpdate, value, options;
	options = Object(arguments[3]);
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
		stamp: options.stamp || now()
	};
	updatesArray.push(itemForUpdate);
};
