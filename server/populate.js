'use strict';

var forEach       = require('es5-ext/object/for-each')
  , isObject      = require('es5-ext/object/is-object')
  , customError   = require('es5-ext/error')
  , dbjsSerialize = require('dbjs/_setup/serialize/value')
  , genId         = require('time-uuid')
  , now           = require('microtime-x')
  , options, main, serializeProperty, serializeObject
  , updatesArray, howMany;

module.exports = function (map/*, options */) {
	options = Object(arguments[1]);
	if (options.howMany) {
		howMany = Math.ceil(Number(options.howMany));
		if (Number.isNaN(howMany) || howMany <= 0) {
			throw customError("hawMany parameter must be a positive integer",
				"WRONG_PARAM_HOW_MANY", { statusCode: 401 });
		}
	}
	updatesArray = [];
	while (howMany--) {
		main(map);
	}
	return updatesArray;
};

main = function (map, objId) {
	var idForUpdate;
	if (map.id) {
		idForUpdate = objId || serializeObject(map.id).id;
		if (Array.isArray(map.value)) {
			map.value.forEach(function (section) {
				main(section, idForUpdate);
			});
		}
		return;
	}
	forEach(map, function (item, key) {
		if (item.id) {
			main(item);
		} else {
			if (item.multiple) {
				item.value.forEach(function (multipleItem, multipleItemKey) {
					if (multipleItem.id) {
						idForUpdate = serializeObject(multipleItem.id).id;
						serializeProperty(objId, key + '*' + idForUpdate, true);
						main(multipleItem, idForUpdate);
					} else {
						serializeProperty(objId, key + '*' + multipleItemKey, multipleItem);
					}
				});
			} else {
				serializeProperty(objId, key, item);
			}
		}
	});
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
