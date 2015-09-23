// Unserialize view string into array of resolved data

'use strict';

var stringify = JSON.stringify;

module.exports = function (view, type) {
	if (!view) return [];
	return view.split('\n').map(function (data) {
		var item;
		data = data.split('.');
		item = type.getById(data[1]);
		if (!item) {
			throw new Error("Not object found for " + stringify(data[1]) +
				" (full data: " + stringify(data) + ") by type: " + stringify(type.__id__));
		}
		return { item: item, index: Number(data[0]) };
	});
};
