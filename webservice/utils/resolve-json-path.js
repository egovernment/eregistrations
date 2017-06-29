'use strict';

module.exports = function (json, path) {
	var result = json, splitPath;
	splitPath = path.split('/');
	splitPath.every(function (segment, index) {
		if (!result[segment] && (index < (splitPath.length - 1))) {
			result = null;
			return false;
		}
		result = result[segment];
		return true;
	});

	return result;
};
