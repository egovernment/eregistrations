'use strict';

var nextTick = require('next-tick');

module.exports = function (el) {

	var setPosition = function () {
		el.scrollTop = el.scrollHeight;
	};

	nextTick(setPosition);

};
