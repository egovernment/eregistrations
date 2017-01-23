'use strict';

var _ = require('mano').i18n;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		ul({ id: 'statistics-sub-menu', class: 'pills-nav' }, [
			li({ id: 'completed-files-nav' },
				a({ href: '/files/', class: 'pills-nav-pill' }, _("Completed files"))),
			li({ id: 'pending-files-nav' },
				a({ href: '/files/pending/', class: 'pills-nav-pill' }, _("Pending files"))),
			li({ id: 'accounts-nav' },
				a({ href: '/files/accounts/', class: 'pills-nav-pill' }, _("Accounts")))
		]);
		div({ class: 'statistics-main blocks-container', id: 'statistics-main' });
	}
};
