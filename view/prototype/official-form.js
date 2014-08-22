'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports['official-form'] = { class: { active: true } };

exports.tab = function () {
	h3("Incorporation approved");
	form(
		input({ type: 'number' }),
		input({ class: 'incorporation-number-submit', type: 'submit', value: 'Save' })
	);
	p("Upload here the certificates:");
	form(
		{ class: 'incorporation-documents-upload', method: 'post' },
		input({ dbjs: user._incorporationCertificateFile }),
		input({ dbjs: user._registeredArticlesFile })
	);
	hr();
	h3("Request changes to the application");
	form(
		ul(
			{ class: 'form-elements' },
			li(textarea({ placeholder: "Write request for changes here" }))
		),
		input({ type: 'submit', value: 'Send back for modyfications' })
	);
	hr();
	h3("Reject application");
	form(
		ul(
			{ class: 'form-elements' },
			li(textarea({ placeholder: "Reason of rejection" }))
		),
		input({ class: 'incorporation-rejection',
			type: 'submit', value: 'Reject the incorporation' })
	);
};
