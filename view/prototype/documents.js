'use strict';

var db = require('mano').db,
	user = db.User.prototype,
	renderFile;

renderFile = function (options) {
	return div(div(this.valueDOM = ul({ class: 'user-uploaded-files' })),
			a({ class: 'user-uploaded-files-upload-button' }, label("+ Choose file",
				this.control = input({ type: 'file' })))
			);
};

exports.step = function () {
	section(
		{ 'class': 'section-primary' },
		h2("3 Upload Your Documents"),
		ul(
			{ class: 'submissions' },
			user.requiredSubmissions,
			function (submission) {
				return li(form(div(h3(submission.label), hr(),
								input({ dbjs: submission._files, render: renderFile }))));
			}
		)
	);

	section(
		{ 'class': 'section-primary' },
		div(
			{ 'class': 'section-primary-warning' },
			p(
				"The filled single form is automatically generated by the system. Click button to " +
					"generate and print. The form must be signed by all Directors, the Company " +
					"Secretary and all Subscribers of the company or their authorised representatives. " +
					"Once signed, please upload it onto the system using the button below."
			),
			a("View and print form")
		)
	);

	div({ 'class': 'next-step' },
		a({ 'href': '/submission/' }, "Continue to next step")
		);
};
