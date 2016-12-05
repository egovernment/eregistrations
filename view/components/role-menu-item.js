'use strict';

var db = require('../../db');

module.exports = function (context, role) {
	var user = context.manager || context.user
	  , roleTitle;

	if (!db.Role.meta[role]) return;
	roleTitle = db.Role.meta[role].label;

	if (user.currentRoleResolved === role) {
		return li({ class: 'header-top-menu-dropdown-item-active' }, a({ href: '/' }, roleTitle));
	}

	return li(form({ method: 'post', action: '/set-role/' },
		input({ type: 'hidden', name: user.__id__ + '/currentRole', value: role }),
		button({ type: 'submit' }, roleTitle)));
};
