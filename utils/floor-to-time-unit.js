'use strict';

module.exports = function (date, mode) {
	switch (mode) {
	case 'weekly':
		var dayOfWeek = date.getUTCDay(), modifier;
		if (dayOfWeek === 0) {
			modifier = -6;
		} else {
			modifier = -(dayOfWeek - 1);
		}
		date.setUTCDate(date.getUTCDate() + modifier);
		break;
	case 'monthly':
		date.setUTCDate(1);
		break;
	case 'yearly':
		date.setUTCDate(1);
		date.setUTCMonth(0);
		break;
	default:
		break;
	}

	return date;
};
