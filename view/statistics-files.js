'use strict';

var _ = require('mano').i18n;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		ul({ id: 'statistics-sub-menu', class: 'pills-nav' }, [
			li({ class: 'bring-to-front', id: 'flow-by-certificate-nav' },
				a({ href: '/files/', class: 'pills-nav-pill' }, _("Certificates"))),
			li({ class: 'bring-to-front', id: 'flow-by-role-nav' },
				a({ href: '/files/by-role/', class: 'pills-nav-pill' }, _("Roles"))),
			li({ class: 'bring-to-front', id: 'flow-by-operator-nav' },
				a({ href: '/files/by-operator/', class: 'pills-nav-pill' }, _("Roles / operators"))),
			li({ class: 'bring-to-front', id: 'pending-files-nav' },
				a({ href: '/files/pending/', class: 'pills-nav-pill' }, _("Pending"))),
			li({ class: 'bring-to-front', id: 'files-details-nav' },
				a({ href: '/files/details/', class: 'pills-nav-pill' }, _("Details")))
		]);
		div({ class: 'statistics-main blocks-container', id: 'statistics-main' });
	}
};
