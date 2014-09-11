'use strict';

exports.main = function () {
	div({ class: 'submitted-menu' },
		div({ class: 'submitted-menu-bar', id: 'submitted-menu' })
		);
	div({ class: 'content', id: 'sub-main' });
};
