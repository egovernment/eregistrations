'use strict';

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		div({ class: 'meta-admin-main', id: 'meta-admin-main' });
	}
};
