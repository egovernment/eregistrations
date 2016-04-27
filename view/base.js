// Base for system views (root of a view tree)
//
// This view is meant to be additionally customised per eregistrations system,
// for full picture of configuration, be sure to visit customisation module
// in system you're working at (most likely placed at /view/base.js)

'use strict';

var _              = require('mano').i18n.bind('View')
  , modalContainer = require('./components/modal-container');

exports.body = function () {
	var modalCurtain;

	header({ class: 'header-top' },
		div({ class: 'content header-top-wrapper' },
			div({ class: 'header-top-logo' }, a({ href: '/' }, exports._logo(this))),
			nav({ id: 'menu' })
			)
		);
	modalCurtain = div({ class: 'modal-courtain' });

	main({ id: 'main' });

	footer({ class: 'footer-logos' },
		exports._footerContent(this));

	insert(modalContainer);
	div({ class: 'throbber' },
		div({ class: 'throbber-courtain' }),
		div({ class: 'spinner-loader' }, _("Loading...")));

	// iOS fix, without that modals don't get closed
	modalCurtain.addEventListener('click', Function.prototype, false);

	insert(exports._bodyAppend(this));
};

exports._logo = Function.prototype;
exports._footerContent = Function.prototype;
exports._bodyAppend = Function.prototype;
