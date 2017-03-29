'use strict';

var _  = require('mano').i18n.bind("View: Duration format");
/**
 *
 * @param msTime { Number } - time in milliseconds
 * @returns { String }      - formatted time string
 */
module.exports = function (msTime) {
	var hours, minutes;
	if (isNaN(msTime)) throw new Error("Get duration expects a number.");
	minutes = Math.round(msTime / (1000 * 60));
	if (!minutes) return _("< 1 m ");
	hours   = Math.floor(minutes / 60);
	minutes = minutes % 60;
	if (!hours) return _("${ minutes } m", { minutes: minutes });
	if (!minutes) return _("${ hours } h", { hours: hours });
	return _("${ hours } h, ${ minutes } m",
		{ hours: hours, minutes: minutes });
};
