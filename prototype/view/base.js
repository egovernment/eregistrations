'use strict';

module.exports = exports = require('../../view/base');

var isReadOnlyRender = require('mano/client/utils/is-read-only-render');

exports.title = "eRegistrations: Prototype demo";

exports.head = function () {
	meta({ name: 'viewport', content: 'width=device-width' });

	if (isReadOnlyRender) {
		// SPA takeover
		script(function (appUrl) {
			var isStrict;
			if (typeof Object.getPrototypeOf !== 'function') return;
			if (typeof Object.defineProperty !== 'function') return;
			if (!window.history) return;
			isStrict = !(function () { return this; }());
			if (!isStrict) return;
			if (Object.getPrototypeOf({ __proto__: Function.prototype }) !== Function.prototype) return;
			if (Object.defineProperty({}, 'foo',  { get: function () { return 'bar'; } }).foo !== 'bar') {
				return;
			}
			if (document.cookie.indexOf('legacy=1') !== -1) return;
			document.write('<scr' + 'ipt defer src="' + appUrl + '"></sc' + 'ript>');
		}, stUrl('prototype.js'));
	}

	script({ src: stUrl('prototype.legacy.js') });
	link({ href: stUrl('prototype.css'), rel: 'stylesheet' });
	if (isReadOnlyRender) link({ href: stUrl('prototype-legacy.css'), rel: 'stylesheet' });
};

exports._logo = function () { return img({ src: '/img/logo-2.png' }); };

exports._bodyAppend = function () {
	return dialog(
		{ id: 'dialog-app-nav', open: true, class: 'app-nav-dialog' },
		header(
			h4("Application navigation"),
			a({ onclick: '$(\'dialog-app-nav\').exclude()' }, span({ class: 'fa fa-close' }, "Close"))
		),
		section(ol(
			// Public views
			li(
				a({ href: '/' },
					span("Login"),
					span({ class: 'label-reg' }, "Public"))
			),
			li(
				a({ href: '/reset-password/' },
					span("Reset password"),
					span({ class: 'label-reg' }, "Public"))
			),
			// User views
			li(
				a({ href: '/profile/' },
					span("User: Profile"),
					span({ class: 'label-reg' }, "Part B"))
			),
			// Part A views
			li(
				a({ href: '/guide/' },
					span("User: Guide"),
					span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/guide-lomas/' },
					span("User: Guide: Lomas like"),
					span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/guide/costs-print/' },
					span("User: Guide: Costs print"),
					span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/forms/' },
					span("User: Forms"),
					span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/forms/disabled/' },
					span("User: Forms: Disabled"),
					span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/forms/tabbed/' },
					span("User: Forms: Tabbed"),
					span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/nested-entity/example/' },
					span("User: Forms: Add entity"),
					span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/documents/' },
					span("User: Documents"),
					span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/documents/disabled/' },
					span("User: Documents: Disabled"),
					span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/pay/' },
					span("User: Payment"),
					span({ class: 'label-reg' }, "Part A"))
			),
			li(
				a({ href: '/submission/' },
					span("User: Submission"),
					span({ class: 'label-reg' }, "Part A"))
			),
			// Business Process Submitted views
			li(
				a({ href: '/business-process-submitted/' },
					span("User: Submitted"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/business-process-submitted/payment-receipts/payment/' },
					span("User: Submitted: Receipts"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/business-process-submitted/certificates/certificate/' },
					span("User: Submitted: Certificates"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/business-process-submitted/data/' },
					span("User: Submitted: Data"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/print-business-process-data/' },
					span("User: Submitted: Data print"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/print-request-history/' },
					span("User: Submitted: History print"),
					span({ class: 'label-reg' }, "Part B"))
			),
			// My Account views
			li(
				a({ href: '/my-account/' },
					span("My Account"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/my-account/requests/' },
					span("My Account: Requests"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/my-account/summary/' },
					span("My Account: Request: Summary"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/my-account/documents/' },
					span("My Account: Request: Documents"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/my-account/data/' },
					span("My Account: Request: Data"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/my-account/print/' },
					span("My Account: Request: Data print"),
					span({ class: 'label-reg' }, "Part B"))
			),
			// Official views
			li(
				a({ href: '/official/' },
					span("Official"),
					span({ class: 'label-reg' }, "Part B"))
			),
			// Official Processing views
			li(
				a({ href: '/official/business-process-id/' },
					span("Official: Processing"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/official/business-process-id/documents/' },
					span("Official: Processing: Documents"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/official/business-process-id/payment-receipts/payment/' },
					span("Official: Processing: Payments"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/official/business-process-id/certificates/certificate/' },
					span("Official: Processing: Certificates"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/official/business-process-id/data/' },
					span("Official: Processing: Data"),
					span({ class: 'label-reg' }, "Part B"))
			),
			// Official Revision views
			li(
				a({ href: '/revision/business-process-id/' },
					span("Official: Revision"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/revision/business-process-id/payment-receipts/' },
					span("Official: Revision: Payments"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/revision/business-process-id/data/' },
					span("Official: Revision: Data"),
					span({ class: 'label-reg' }, "Part B"))
			),
			li(
				a({ href: '/revision/business-process-id/processing/' },
					span("Official: Revision: Processing"),
					span({ class: 'label-reg' }, "Part B"))
			),
			// Official Front Desk views
			li(
				a({ href: '/front-desk/user-id/' },
						span("Official: Front Desk: Processing"),
						span({ class: 'label-reg' }, "Part B"))
			),
			// Manager views
			li(
				a({ href: '/manager/' },
					span("Notary"),
					span({ class: 'label-reg' }, "Notary"))
			),
			li(
				a({ href: '/manager/requests/' },
					span("Notary: Requests"),
					span({ class: 'label-reg' }, "Notary"))
			),
			li(
				a({ href: '/manager/requests/firstrequest' },
					span("Notary: Request: Guide"),
					span({ class: 'label-reg' }, "Notary"))
			),
			li(
				a({ href: '/manager-validation/edit-user' },
					span("Notary Validation: Edit User"),
					span({ class: 'label-reg' }, "Part B"))
			),
			// Admin views
			li(
				a({ href: '/users-admin/' },
					span("Admin: Users"),
					span({ class: 'label-reg' }, "Admin"))
			),
			li(
				a({ href: '/users-admin/add-user/' },
					span("Admin: Users: Add user"),
					span({ class: 'label-reg' }, "Admin"))
			),
			li(
				a({ href: '/users-admin/edit-user-id/' },
					span("Admin: Users: Edit user"),
					span({ class: 'label-reg' }, "Admin"))
			),
			li(
				a({ href: '/statistics/' },
						span("Admin: Statistics"), span({ class: 'label-reg' }, "Statistics"))
			),
			li(
				a({ href: '/filtered-statistics/' },
						span("Admin: Statistics: Filtered"), span({ class: 'label-reg' }, "Statistics"))
			),
			li(
				a({ href: '/i18n/' },
						span("Admin: Translations"), span({ class: 'label-reg' }, "Meta"))
			)
		)),
		footer()
	);
};

exports._footerContent = function () {
	return div({ class: 'content' },
		div({ class: 'footer-logos-container' },
			img({ src: '/img/logo.png' }),
			img({ src: '/img/logo.png' })
			)
		);
};
