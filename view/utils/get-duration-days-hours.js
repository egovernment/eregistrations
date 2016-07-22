'use strict';

var _  = require('mano').i18n.bind("View: Duration format")
  , _d = _;
/**
 *
 * @param msTime { Number } - time in milliseconds
 * @returns { String }      - formatted time string
 */
module.exports = function (msTime) {
	var days, hours;
	if (isNaN(msTime)) throw new Error("Get duration expects a number.");
	hours = Math.round(msTime / 1000 / 60 / 60);
	days  = Math.floor(hours / 24);
	hours %= 24;
	return _d("${ days } d ${ hours } h", { days: days, hours: hours });
};
