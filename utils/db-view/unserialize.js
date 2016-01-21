// Unserialize view string into array of objects

'use strict';

var unserializeId = require('./unserialize-id');

module.exports = function (view, type) {
	if (!view) return [];
	return view.split('\n').map(function (data) {
		return unserializeId(data, type);
	});
};
