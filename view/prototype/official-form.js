'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports['official-form'] = { class: { active: true } };

exports.tab = function () {
	div(
		{ class: 'official-form' },
		h3("Incorporation approved"),
		form(
			{ class: 'form-single-control' },
			input({ type: 'number' }),
			input({ type: 'submit', value: 'Save' })
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
				li(textarea({ placeholder: "Write request for changes here" }))
			),
			input({ type: 'submit', value: 'Send back for modyfications' })
		),
		hr(),
		h3("Reject application"),
		form(
			ul(
				{ class: 'form-elements' },
				li(textarea({ placeholder: "Reason of rejection" }))
			),
			input({ class: 'official-rejection',
				type: 'submit', value: 'Reject the incorporation' })
		)
	);
};
