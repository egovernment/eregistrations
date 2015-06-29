'use strict';

module.exports = function () {
	if (window.innerWidth < 640) {
		return false;
	}
	return true;
};
