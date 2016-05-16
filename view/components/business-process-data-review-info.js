'use strict';

var _ = require('mano').i18n.bind('View: Component: Data');

module.exports = function (context) {
	var snapshot = context.dataSnapshot;

	return _if(eq(snapshot.status, 'rejected'), div({ class: 'section-secondary info-main' },
		p(_("Data forms were rejected for the following reason(s)"), ': ', snapshot.rejectReason)));
};
