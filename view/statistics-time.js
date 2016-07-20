'use strict';

var _ = require('mano').i18n;

exports._parent = require('./statistics-base');

exports['statistics-sub-menu'] = function () {
	return [
		li({ id: 'per-role-nav' }, a({ href: '/time/', class: 'pills-nav-pill' }, _("Per role"))),
		li({ id: 'per-person-nav' },
			a({ href: '/time/per-person/', class: 'pills-nav-pill' }, _("Per person")))
	];
};