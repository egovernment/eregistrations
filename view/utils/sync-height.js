'use strict';

var nextTick = require('next-tick')

  , round = Math.round;

module.exports = function (el) {
	var lastValue;
	var updateHeight = function () {
		if (el.clientWidth === lastValue) return;
		if (!el.clientWidth) return;
		lastValue = el.clientWidth;
		var height = el.clientWidth * 1.415, diff = height % 22;
		height = round(diff < 11 ? (height - diff) : (height + (22 - diff)));
		el.style.height = height + 'px';
	};
	nextTick(updateHeight);
	setInterval(updateHeight, 300);
	window.addEventListener('resize', updateHeight, false);
};
