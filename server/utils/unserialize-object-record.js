'use strict';

var unserializeValue = require('dbjs/_setup/unserialize/value');

module.exports = function (storageResult) {
	var result = {};
	storageResult.forEach(function (item) {
		var itemId = item.id.split('/').slice(-1)
		  , type, value;

		// We ommit parent object
		if (itemId.length === 0) return;

		type = item.data.value[0];

		if (type === '7') {
			value = { __id__: item.data.value.slice(1) };
		} else {
			value = unserializeValue(item.data.value);
		}

		result[itemId] = value;
	});

	return result;
};
