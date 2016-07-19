'use strict';

var _ = require('mano').i18n;

exports._parent = require('./statistics-base');

exports['statistics-sub-menu'] = function () {
	return [
		li({ id: 'completed-files-nav' },
			a({ href: '/files/', class: 'pills-nav-pill' }, _("Completed files"))),
		li({ id: 'pending-files-nav' },
			a({ href: '/files/pending/', class: 'pills-nav-pill' }, _("Pending files"))),
		li({ id: 'rejected-files-nav' },
			a({ href: '/files/rejected/', class: 'pills-nav-pill' }, _("Rejected files"))),
		li({ id: 'accounts-nav' },
			a({ href: '/files/accounts/', class: 'pills-nav-pill' }, _("Accounts")))
	];
};
