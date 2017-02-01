'use strict';

var _ = require('mano').i18n;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		ul({ id: 'statistics-sub-menu', class: 'pills-nav' }, [
			li({ id: 'flow-by-certificate-nav' },
				a({ href: '/flow/', class: 'pills-nav-pill' }, _("Certificates"))),
			li({ id: 'flow-by-role-nav' },
				a({ href: '/flow/by-role/', class: 'pills-nav-pill' }, _("Roles"))),
			li({ id: 'flow-by-operator-nav' },
				a({ href: '/flow/by-operator/', class: 'pills-nav-pill' }, _("Roles / operators")))
		]);
		div({ class: 'statistics-main blocks-container', id: 'statistics-main' });
	}
};