'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports.step = function () {
	div({ class: 'section-primary-wrapper' }, h1("3. Upload Your Documents"));
	div(
		{ class: 'disabler-range', id: 'documents-disabler-range' },
		section(
			{ class: 'section-primary-wrapper' },
			ul(
				{ class: 'submissions' },
				user.requiredSubmissions,
				function (submission) {
					return li(form(div(h2(submission.label), hr(),
									input({ dbjs: submission._files }))));
				}
			)
		),

		div({ class: 'next-step' },
			a({ href: '/submission/' }, "Continue to next step")
			),
		div({ class: 'disabler' })
	);
};
