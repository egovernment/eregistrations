// Unserialize view string into array of objects

'use strict';

var stringify = JSON.stringify;

module.exports = function (view, type) {
	return view.split('\n').map(function (data) {
		var id = data.slice(data.indexOf('.') + 1)
		  , obj = type.getById(id);
		if (!obj) {
			throw new Error("Not object found for " + stringify(id) +
				" (full data: " + stringify(data) + ") by type: " + stringify(type.__id__));
		}
		return obj;
	});
};
