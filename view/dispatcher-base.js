'use strict';

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		ul({ class: 'pills-nav' }, exports._dispatcherNav(this));
		div({ class: 'meta-admin-main', id: 'dispatcher-main' });
	}
};

exports._dispatcherNav = Function.prototype;
