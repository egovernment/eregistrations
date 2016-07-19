'use strict';

var _ = require('mano').i18n;

exports._parent = require('./statistics-base');

exports['statistics-sub-menu'] = function () {
	return [
		li({ id: 'completed-files-nav' },
			a({ href: '/completed-files/', class: 'pills-nav-pill' }, _("Completed files"))),
		li({ id: 'pending-files-nav' },
			a({ href: '/pending-files/', class: 'pills-nav-pill' }, _("Pending files"))),
		li({ id: 'rejected-files-nav' },
			a({ href: '/rejected-files/', class: 'pills-nav-pill' }, _("Rejected files"))),
		li({ id: 'accounts-nav' },
			a({ href: '/accounts/', class: 'pills-nav-pill' }, _("Accounts")))
	];
};
