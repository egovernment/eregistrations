'use strict';

var _                 = require('mano').i18n
  , submittedMenuItem = require('./components/submitted-menu-item');

exports._parent = require('./abstract-user-base');

exports['submitted-menu'] = function () {
	submittedMenuItem('/', _("Dashboard"), { pattern: /^\/$/ });
	submittedMenuItem('/files/', _("Files"));
	submittedMenuItem('/time/', _("Time"));
	submittedMenuItem('/analysis/', _("Analysis"));
};

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		ul({ id: 'statistics-sub-menu', class: 'pills-nav pills-nav-sub' });
		div({ class: 'statistics-main user-forms', id: 'statistics-main' });
	}
};
