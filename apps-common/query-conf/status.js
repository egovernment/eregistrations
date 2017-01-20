'use strict';

module.exports = {
	name: 'status',
	ensure: function (value) {
		if (value === 'all') return;
		if (!value) return 'pending';

		return value;
	}
};
