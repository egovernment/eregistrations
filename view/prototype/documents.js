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
	div({ class: 'section-primary' }, h2("3 Upload Your Documents"));
	div(
		{ class: 'disabler-range', id: 'documents-disabler-range' },
		section(
			{ class: 'section-primary' },
			ul(
				{ class: 'submissions' },
				user.requiredSubmissions,
				function (submission) {
					return li(form(div(h3(submission.label), hr(),
									input({ dbjs: submission._files, render: renderFile }))));
				}
			)
		),

		div({ class: 'next-step' },
			a({ href: '/submission/' }, "Continue to next step")
			),
		div({ class: 'disabler' })
	);
};
