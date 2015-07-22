// Generic documents user page (Part A)

'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports._parent = require('./user-registration-base');

exports['step-documents'] = { class: { 'step-active': true } };

exports.step = function () {
	exports._documentsHeading();

	div(
		{ class: ['disabler-range', _if(not(eq(this.businessProcess.requirementUploads._progress, 1)),
				'disabler-active')], id: 'documents-disabler-range' },
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
								input({ dbjs: submission._files, label: true })
							))
						);
				}
			)
		),
		div({ class: 'disabler' })
	);
	insert(_if(eq(this.businessProcess.requirementUploads._progress, 1),
		div({ class: 'user-next-step-button' },
			a({ href: '/submission/' }, "Continue to next step"))));
};

exports._documentsHeading = Function.prototype;
