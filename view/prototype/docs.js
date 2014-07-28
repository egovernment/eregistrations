'use strict';

var db = require('mano').db,
	user = db.User.prototype,
	renderFile;

renderFile = function (options) {
	var submission = options.observable.object;

	return div(h2(submission.label),
		div(this.valueDOM = ul({ class: 'documents' })),
			div({ class: 'btn-upload' }, label("+ Choose file", this.control = input({ type: 'file' })))
			);
};

exports.step = function () {
	section(
		{ 'class': 'section-primary' },
		ul(
			{ class: 'submissions' },
			user.requiredSubmissions,
			function (submission) {
				console.log(submission.__id__)
				return li(form({ action: url('documents'), method: 'post',
							enctype: 'multipart/form-data', autoSubmit: true },
							fieldset(input({ dbjs: submission._files, render: renderFile }))));
			}
		)
	);

	div({ 'class': 'next-step', 'href': '#' },
		a("Continue to next step")
		);
};
