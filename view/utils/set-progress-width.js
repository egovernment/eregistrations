// Util for setting width of progress bar in user registration steps-menu

'use strict';

module.exports = function (value) {
	value = Math.round(value * 100);
	return value ? 'width: ' + value + '%' : 'display: none';
};
