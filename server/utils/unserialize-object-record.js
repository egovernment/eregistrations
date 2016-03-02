'use strict';

var unserializeValue = require('dbjs/_setup/unserialize/value');

module.exports = function (storageResult) {
	var result = {};
	storageResult.forEach(function (item) {
		var itemId = item.id.split('/');
		// We ommit parent object
		if (itemId.length === 1) return;
		result[itemId.slice(-1)] = unserializeValue(item.data.value);
	});

	return result;
};
