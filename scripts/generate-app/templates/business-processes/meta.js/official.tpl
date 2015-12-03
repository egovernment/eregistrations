// Meta data for business processes states applicable for this app

'use strict';

var _ = require('../../../i18n').bind('Official');

module.exports = {
	all: {
		label: _("All"),
		order: 5
	},
	pending: {
		label: _("Pending"),
		order: 1,
		default: true
	},
	approved: {
		label: _("Approved"),
		order: 2
	},
	rejected: {
		label: _("Rejected"),
		order: 3
	},
	sentBack: {
		label: _("Sent for corrections"),
		order: 4
	}
};
