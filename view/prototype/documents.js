'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports['step-documents'] = { class: { 'step-active': true } };

exports.step = function () {
	div(
		{ class: 'capital-first' },
		div("3"),
		div(h1("Upload Your Documents"),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit."))
	);

	div(
		{ class: 'disabler-range', id: 'documents-disabler-range' },
		section(
			ul(
				{ class: 'sections-primary-list user-documents-upload' },
				user.requiredSubmissions,
				function (submission) {
					return li({ class: 'section-primary' },
						form({ class: 'auto-submit' },
							div(
								h2(submission.label),
								small(submission.legend),
								hr(),
								input({ dbjs: submission._files })
							))
						);
				}
			)
		),

		div({ class: 'user-next-step-button' },
			a({ href: '/submission/' }, "Continue to next step")
			),
		div({ class: 'disabler' })
	);
};
