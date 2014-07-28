'use strict';

var db = require('mano').db,
	user = db.User.prototype,
	renderFile;

renderFile = function (options) {
	var submission = options.observable.object;

	return fieldset(h2(submission.label),
		div(this.valueDOM = ul({ class: 'documents' })),
			div({ class: 'btn-upload' }, label("+ Choose file", this.control = input({ type: 'file' })))
			);
};

exports.step = function () {
	p("test");

	div(
		ul(
			{ class: 'submissions' },
			user.requiredSubmissions.toArray(),
			function (submission) {
				return li(form({ action: url('documents'), method: 'post',
							enctype: 'multipart/form-data', autoSubmit: true },
							div(input({ dbjs: submission._files, render: renderFile }))));
			}
		)
	);

	div({ 'class': 'next-step', 'href': '#' },
		a("Continue to next step")
		);
};
