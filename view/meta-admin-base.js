'use strict';

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		ul({ class: 'pills-nav' }, exports._metaAdminNav.call(this));
		div({ class: 'meta-admin-main', id: 'meta-admin-main' });
	}
};

exports._metaAdminNav = Function.prototype;
