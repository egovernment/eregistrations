'use strict';

exports['official-form'] = { class: { active: true } };

exports.tab = function () {
	h3("Incorporation approved");
	form(
		input({ type: 'number' }),
		input({ class: 'incorporation-number-submit', type: 'submit', value: 'Save' })
	);
	p("Upload here the certificates:");
	p(
		{ class: 'incorporation-documents-upload' },
		button({ class: 'button-main ' }, "Certificate of incorporation"),
		button({ class: 'button-main ' }, "Registered articles of association")
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
