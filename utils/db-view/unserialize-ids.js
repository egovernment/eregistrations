// Unserialize view string into array of objects

'use strict';

module.exports = function (view, type) {
	if (!view) return [];
	return view.split('\n').map(function (data) {
		return data.slice(data.indexOf('.') + 1);
	});
};
