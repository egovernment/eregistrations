'use strict';

var modalContainer = require('./_modal-container');

exports.body = function () {
	var modalCurtain, logoAnchorOptions;

	if (this.businessProcess) {
		logoAnchorOptions = { href: '/my-account/', rel: 'server' };
	} else {
		logoAnchorOptions = { href: '/' };
	}

	header({ class: 'header-top' },
		div({ class: 'content header-top-wrapper' },
			div({ class: 'header-top-logo' }, a(logoAnchorOptions, exports._logo(this))),
			nav(ul({ class: 'header-top-menu', id: 'menu' }))
			)
		);
	modalCurtain = div({ class: 'modal-courtain' });

	main({ id: 'main' });

	footer({ class: 'footer-logos' },
		exports._footerContent(this));

	insert(modalContainer);

	// iOS fix, without that modals don't get closed
	modalCurtain.addEventListener('click', Function.prototype, false);

	insert(exports._bodyAppend(this));
};

exports._logo = Function.prototype;
exports._footerContent = Function.prototype;
exports._bodyAppend = Function.prototype;
