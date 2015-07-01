'use strict';

exports.body = function () {
	header();
	main(
		div({ class: 'submitted-menu' },
			div({ class: 'submitted-menu-bar content', id: 'submitted-menu' })),
		div({ class: 'user-forms', id: 'sub-main' })
	);
	footer();
};

exports._logo = function () {};
exports._footer = function () {};
