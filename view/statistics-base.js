'use strict';

var _ = require('mano').i18n;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		ul({ class: 'pills-nav' }, exports._statisticsNav.call(this));
		div({ class: 'statistics-main', id: 'statistics-main' });
	}
};

exports._statisticsNav = function () {
	return [
		li({ id: 'files-nav' }, a({ href: '/', class: 'pills-nav-pill' }, _("Files"))),
		li({ id: 'accounts-nav' }, a({ href: '/accounts/', class: 'pills-nav-pill' }, _("Accounts"))),
		li({ id: 'registrations-nav' }, a({ href: '/registrations/', class: 'pills-nav-pill' },
			_("Registrations")))
	];
};
