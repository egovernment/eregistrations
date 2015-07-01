'use strict';

var modalContainer = require('./_modal-container');

exports.body = function () {
	var modalCurtain;

	header({ class: 'header-top' },
		div({ class: 'content header-top-wrapper' },
			div({ class: 'header-top-logo' }, a({ href: '/' }, exports._logo())),
			nav(ul({ class: 'header-top-menu', id: 'menu' }))
			)
		);
	modalCurtain = div({ class: 'modal-courtain' });

	insert(exports._bodyAppend());

	main({ id: 'main' });

	footer({ class: 'footer-logos' },
		exports._footerContent());

	insert(modalContainer);

	// iOS fix, without that modals don't get closed
	modalCurtain.addEventListener('click', Function.prototype, false);
};

exports._logo = Function.prototype;
exports._footerContent = Function.prototype;
exports._bodyAppend = Function.prototype;
