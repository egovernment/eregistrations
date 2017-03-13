'use strict';

module.exports = function (date, mode) {
	switch (mode) {
	case 'weekly':
		date.setUTCDate(date.getUTCDate() + 7);
		break;
	case 'monthly':
		date.setUTCMonth(date.getUTCMonth() + 1);
		break;
	case 'yearly':
		date.setUTCFullYear(date.getUTCFullYear() + 1);
		break;
	default:
		date.setUTCDate(date.getUTCDate() + 1);
		break;
	}

	return date;
};
