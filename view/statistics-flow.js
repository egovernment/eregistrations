'use strict';

var _ = require('mano').i18n;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		ul({ id: 'statistics-sub-menu', class: 'pills-nav' }, [
			li({ class: 'bring-to-front', id: 'flow-by-certificate-nav' },
				a({ href: '/flow/', class: 'pills-nav-pill' }, _("Certificates"))),
			li({ class: 'bring-to-front', id: 'flow-by-role-nav' },
				a({ href: '/flow/by-role/', class: 'pills-nav-pill' }, _("Roles"))),
			li({ class: 'bring-to-front', id: 'flow-by-operator-nav' },
				a({ href: '/flow/by-operator/', class: 'pills-nav-pill' }, _("Roles / operators"))),
			li({ class: 'bring-to-front', id: 'flow-rejections-nav' },
				a({ href: '/flow/rejections/', class: 'pills-nav-pill' }, _("Reasons of rejection")))
		]);
		div({ class: 'statistics-main blocks-container', id: 'statistics-main' });
	}
};
