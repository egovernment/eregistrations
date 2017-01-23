'use strict';

var _ = require('mano').i18n;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		ul({ id: 'statistics-sub-menu', class: 'pills-nav' }, [
			li({ id: 'per-role-nav' }, a({ href: '/time/', class: 'pills-nav-pill' }, _("Per role"))),
			li({ id: 'per-person-nav' },
				a({ href: '/time/per-person/', class: 'pills-nav-pill' }, _("Per person")))
		]);
		div({ class: 'statistics-main blocks-container', id: 'statistics-main' });
	}
};
