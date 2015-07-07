'use strict';

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		ul({ class: 'pills-nav' }, exports._pillsNav(this));
		div({ id: 'meta-admin-main' });
	}
};

exports._pillsNav = Function.prototype;
