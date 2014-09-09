'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports.step = function () {
	div(h1("3. Upload Your Documents"));
	div(
		{ class: 'disabler-range', id: 'documents-disabler-range' },
		section(
			ul(
				{ class: 'sections-primary-list user-documents-upload' },
				user.requiredSubmissions,
				function (submission) {
					return li({ class: 'section-primary' },
						form(
							div(
								h2(submission.label),
								small(submission.legend),
								hr(),
								input({ dbjs: submission._files })
							)
						)
						);
				}
			)
		),

		div({ class: 'next-step' },
			a({ href: '/submission/' }, "Continue to next step")
			),
		div({ class: 'disabler' })
	);
};
