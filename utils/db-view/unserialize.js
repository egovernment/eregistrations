// Unserialize view string into array of objects

'use strict';

module.exports = function (view, type) {
	return view.split('\n').map(function (data) {
		return type.getById(data.slice(data.indexOf('.') + 1));
	});
};
