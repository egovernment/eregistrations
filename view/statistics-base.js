'use strict';

var _ = require('mano').i18n;

exports._parent = require('./abstract-user-base');

exports['submitted-menu'] = function () {
	li({ id: 'dashboard-nav' }, a({ href: '/' }, _("Dashboard")));
	li({ id: 'files-nav' }, a({ href: '/files/' }, _("Files")));
	li({ id: 'time-nav' }, a({ href: '/time/' }, _("Time")));
	li({ id: 'analysis-nav' }, a({ href: '/analysis/' }, _("Analysis")));
};

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		ul({ id: 'statistics-sub-menu', class: 'pills-nav' });
		div({ class: 'statistics-main user-forms', id: 'statistics-main' });
	}
};
