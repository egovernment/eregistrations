// Unserialize view string into array of resolved data

'use strict';

var unserializeId = require('./unserialize-id');

module.exports = function (view, type) {
	if (!view) return [];
	return view.split('\n').map(function (data) {
		return { item: unserializeId(data, type), index: Number(data.split('.')[0]) };
	});
};
