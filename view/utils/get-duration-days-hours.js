'use strict';

var _  = require('mano').i18n.bind("View: Duration format");
/**
 *
 * @param msTime { Number } - time in milliseconds
 * @returns { String }      - formatted time string
 */
module.exports = function (msTime) {
	var days;
	if (isNaN(msTime)) throw new Error("Get duration expects a number.");
	days = Math.round(msTime / (1000 * 60 * 60 * 24));
	if (!days) return _("< 1 d ");
	return _("${ days } d", { days: days });
};
