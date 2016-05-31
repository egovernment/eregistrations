'use strict';

module.exports = function (t, a) {
	var foo = {
		revision: {
			pending: 'pending',
			sentBack: 'sentBack'
		},
		frontDesk: {
			pending: 'pending',
			approved: 'approved'
		}
	};

	a.deep(t(foo), {
		revision: {
			pending: 'pending',
			sentBack: 'sentBack'
		},
		frontDesk: {
			pending: 'pending'
		}
	});
};
