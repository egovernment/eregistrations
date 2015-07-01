'use strict';

var noop           = require('es5-ext/function/noop')
  , modalContainer = require('../prototype/view/_modal-container');

exports.body = function () {
	var modalCurtain;

	header({ class: 'header-top' },
		div({ class: 'content header-top-wrapper' },
			div({ class: 'header-top-logo' }, a({ href: '/' }, exports._logo())),
			nav(exports._headerNav())
			)
		);
	modalCurtain = div({ class: 'modal-courtain' });

	dialog(
		{ id: 'dialog-app-nav', open: true, class: 'app-nav-dialog' },
		header(
			exports._appNavDialogHeaderTitle(),
			a({ onclick: '$(\'dialog-app-nav\').exclude()' }, span({ class: 'fa fa-close' }, "Close"))
		),
		section(exports._appNavDialogList()),
		footer()
	);

	main({ id: 'main' });
	footer({ class: 'footer-logos' },
		exports._footerContent());
	insert(modalContainer);

	// iOS fix, without that modals don't get closed
	modalCurtain.addEventListener('click', noop, false);
};

exports._logo = Function.prototype;
exports._headerNav = Function.prototype;
exports._appNavDialogHeaderTitle = Function.prototype;
exports._appNavDialogList = Function.prototype;
exports._footerContent = Function.prototype;
