'use strict';

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		ul({ id: 'statistics-sub-menu', class: 'pills-nav' });
		div({ class: 'statistics-main user-forms', id: 'statistics-main' });
	}
};
