'use strict';

var nextTick = require('next-tick');

module.exports = function (el) {
	var updateHeight = function () {
		el.style.height = (el.clientWidth * 1.415) + 'px';
	};
	nextTick(updateHeight);
	window.addEventListener('resize', updateHeight, false);
};
