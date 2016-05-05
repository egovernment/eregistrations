'use strict';

var nextTick = require('next-tick')

  , round = Math.round;

module.exports = function (el) {
	var lastValue;
	var updateHeight = function () {
		if (el.clientWidth === lastValue) return;
		lastValue = el.clientWidth;
		if (!el.clientWidth) return;
		var height = el.clientWidth * 1.415, diff = height % 22;
		height = round(diff < 11 ? (height - diff) : (height + (22 - diff)));
		el.style.height = height + 'px';
	};
	nextTick(updateHeight);
	setInterval(updateHeight, 300);
	window.addEventListener('resize', updateHeight, false);
};
