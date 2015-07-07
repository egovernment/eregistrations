'use strict';

module.exports = exports = require('../../view/meta-admin-base');

exports._metaAdminNav = function () {
	return [li({ class: 'pills-nav-active' }, a({ class: 'pills-nav-pill' }, 'Translations')),
		li(a({ class: 'pills-nav-pill' }, 'Lorem ipsum')),
		li(a({ class: 'pills-nav-pill' }, 'Lorem '))];
};
