'use strict';

var _ = require('mano').i18n;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		ul({ class: 'pills-nav' }, exports._statisticsNav.call(this));
		ul({ id: 'statistics-sub-menu', class: 'pills-nav sub-pills-nav' });
		div({ class: 'statistics-main', id: 'statistics-main' });
	}
};

exports._statisticsNav = function () {
	return [
		li({ id: 'dashboard-nav' }, a({ href: '/', class: 'pills-nav-pill' }, _("Dashboard"))),
		li({ id: 'files-nav' }, a({ href: '/completed-files/', class: 'pills-nav-pill' }, _("Files"))),
		li({ id: 'time-nav' }, a({ href: '/per-role/', class: 'pills-nav-pill' },
			_("Time"))),
		li({ id: 'analysis-nav' }, a({ href: '/analysis/', class: 'pills-nav-pill' },
			_("Analysis")))
	];
};
