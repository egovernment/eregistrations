'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports['official-form'] = { class: { active: true } };

exports.tab = function () {
	div(
		{ class: 'section-primary official-form' },
		h3("Incorporation approved"),
		form(
			{ class: 'form-single-control ' },
			p(
				{ class: 'input' },
				input({ class: 'input', type: 'number' }),
				input({ type: 'submit', value: 'Save' })
			)
		),
		p("Upload here the certificates:"),
		form(
			{ class: 'official-form-upload', method: 'post' },
			input({ dbjs: user._incorporationCertificateFile }),
			input({ dbjs: user._registeredArticlesFile })
		),
		hr(),
		h3("Request changes to the application"),
		form(
			ul(
				{ class: 'form-elements' },
				li(
					{ class: 'input' },
					input({ dbjs: user.getObservable('descriptionText') })
				)
			),
			p(
				{ class: 'input' },
				input({ type: 'submit', value: 'Send back for modifications' })
			)
		),
		hr(),
		h3("Reject application"),
		form(
			ul(
				{ class: 'form-elements' },
				li(
					{ class: 'input' },
					input({ dbjs: user.getObservable('descriptionText') })
				)
			),
			p(
				{ class: 'input' },
				input({ class: 'official-rejection',
					type: 'submit', value: 'Reject the incorporation' })
			)
		)
	);
};
