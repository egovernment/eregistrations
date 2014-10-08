'use strict';

var db = require('mano').db
  , user = db.User.prototype;

exports['step-form'] = { class: { 'step-active': true } };

exports.step = function () {
	h1("2. Fill the form");
	div({ class: 'error-main' },
		p(span({ class: 'fa fa-exclamation-circle' }), "Please fill the Guide first"));
	div(
		{ class: 'disabler-range', id: 'forms-disabler-range' },
		section({ class: 'section-primary' },
			form(
				h2("Business Owner basic informations"),
				hr(),
				fieldset(
					{ class: 'form-elements' },
					ul(
						['firstName', 'lastName', 'dateOfBirth', 'userEmail', 'street'],
						function (name) { return field({ dbjs: user.getObservable(name) }); }
					)
				),
				p({ class: 'submit-placeholder input' },
					input({ type: 'submit' }, "Submit")),
				p({ class: 'button-scroll-top' },
					a({ onclick: 'window.scroll(0, 0)' }, span({ class: 'fa fa-arrow-up' }, "Back to top")))
			)),

		section(
			{ class: 'section-primary' },
			form(
				h2("Business Owner secondary informations"),
				hr(),
				div({ class: 'sub-section' },
					h3("First subsection"),
					fieldset(
						{ class: 'form-elements' },
						ul(
							['companyType', 'members', 'inventory', 'surfaceArea', 'isOwner', 'businessActivity',
								'registerIds'],
							function (name) { return field({ dbjs: user.getObservable(name) }); }
						)
					)),
				div({ class: 'sub-section' },
					h3("Second subsection"),
					fieldset(
						{ class: 'form-elements' },
						ul(
							['companyType', 'members', 'inventory', 'surfaceArea', 'isOwner', 'businessActivity',
								'descriptionText', 'notification', 'isShoppingGallery', 'registerIds'],
							function (name) {
								if (name === 'notification') {
									return field({ dbjs: user.getObservable(name), type: 'radio',
										input: {
											class: 'multiline',
											renderOption: function (labelTxt) {
												var data = {};
												data.dom = li(label({ class: 'input-aside' },
													span(data.input = input()),
													span(labelTxt)));
												return data;
											}
										}
										});
								}
								if (name === 'isShoppingGallery') {
									var data = li(div({ class: 'dbjs-input-component' },
										label(
											{ for: 'input-' + name },
											"Is shopping gallery?"
										),
										div({ class: 'input' },
											input({ control: { id: 'input-' + name }, dbjs: user.getObservable(name),
												type: 'checkbox' }))));
									return data;
								}
								return field({ dbjs: user.getObservable(name) });
							}
						)
					)),
				p({ class: 'submit-placeholder input' },
					input({ type: 'submit' }, "Submit")
					),
				p(
					{ class: 'button-scroll-top' },
					a({ onclick: 'window.scroll(0, 0)' },
						span({ class: 'fa fa-arrow-up' }, "Back to top"))
				)
			)
		),

		section({ class: 'section-primary' },
			div(
				div(
					h2("Directors & non-directors owner / partners"),
					hr(),
					table(
						{ class: 'entities-overview-table' },
						thead(
							tr(
								th({ class: 'desktop-only' }, "Entity"),
								th("First name"),
								th("Surname"),
								th({ class: 'desktop-only' }, "Director?"),
								th({ class: 'desktop-only' }, "Subscriber?"),
								th({ class: 'desktop-only' }, ""),
								th({ class: 'actions' }, "Actions")
							)
						),
						tbody(
							tr(
								td({ class: 'desktop-only' },
									a({ href: '/forms/partner-id/' }, "Lorem")),
								td(a({ href: '/forms/partner-id/' }, "John")),
								td(a({ href: '/forms/partner-id/' }, "Watson")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only confirmed' }, "✓"),
								td({ class: 'actions' },
									a("Edit"),
									a("Delete"))
							),
							tr(
								td({ class: 'desktop-only' },
									a({ href: '/forms/partner-id/' }, "Lorem")),
								td(a({ href: '/forms/partner-id/' }, "John")),
								td(a({ href: '/forms/partner-id/' }, "Watson")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only confirmed' }, "✓"),
								td({ class: 'actions' },
									a("Edit"),
									a("Delete"))
							),
							tr(
								td({ class: 'desktop-only' },
									a({ href: '/forms/partner-id/' }, "Lorem")),
								td(a({ href: '/forms/partner-id/' }, "John")),
								td(a({ href: '/forms/partner-id/' }, "Watson")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only confirmed' }, "✓"),
								td({ class: 'actions' },
									a("Edit"),
									a("Delete"))
							),
							tr(
								td({ class: 'desktop-only' },
									a({ href: '/forms/partner-id/' }, "Lorem")),
								td(a({ href: '/forms/partner-id/' }, "John")),
								td(a({ href: '/forms/partner-id/' }, "Watson")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only confirmed' }, "✓"),
								td({ class: 'actions' },
									a("Edit"),
									a("Delete"))
							),
							tr(
								td({ class: 'desktop-only' },
									a({ href: '/forms/partner-id/' }, "Lorem")),
								td(a({ href: '/forms/partner-id/' }, "John")),
								td(a({ href: '/forms/partner-id/' }, "Watson")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only' }, a({ href: '/forms/partner-id/' }, "Yes")),
								td({ class: 'desktop-only confirmed' }, "✓"),
								td({ class: 'actions' },
									a("Edit"),
									a("Delete"))
							)
						)
					)
				)
			),
			p(
				a(
					{ class: 'new-entity', href: '/forms/partner-add/' },
					"Add new partner"
				)
			),
			p({ class: 'button-scroll-top' },
				a({ onclick: 'window.scroll(0, 0)' }, span({ class: 'fa fa-arrow-up' }, "Back to top")))),

		section({ class: 'section-primary' },
			div(
				div(
					h2("Directors & non-directors owner / partners"),
					hr(),
					table(
						{ class: 'entities-overview-table' },
						thead(
							tr(
								th({ class: 'desktop-only' }, "Entity"),
								th("First name"),
								th("Surname"),
								th({ class: 'desktop-only' }, "Director?"),
								th({ class: 'desktop-only' }, "Subscriber?"),
								th({ class: 'desktop-only' }, ""),
								th({ class: 'actions' }, "Actions")
							)
						),
						tbody(
							{ onEmpty: tr(
								{ class: 'empty' },
								td(
									{ colspan: 7 },
									"There are no partners added at the moment."
								)
							) },
							[],
							function () {}
						)
					)
				)
			),
			p(
				a(
					{ class: 'new-entity', href: '/forms/partner-add/' },
					"Add new partner"
				)
			),
			p({ class: 'button-scroll-top' },
				a({ onclick: 'window.scroll(0, 0)' }, span({ class: 'fa fa-arrow-up' }, "Back to top")))),

		div({ class: 'next-step' },
			a({ href: '/documents/' }, "Continue to next step")),
		div({ class: 'disabler' })
	);
};
