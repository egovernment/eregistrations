'use strict';

var db = require('mano').db,
	user = db.User.prototype,
	renderFile;

renderFile = function (options) {
	return div(div(this.valueDOM = ul({ class: 'documents' })),
			a({ class: 'doc-upload-button' }, label("+ Choose file",
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
				return li(form({ action: url('documents'), method: 'post',
							enctype: 'multipart/form-data', autoSubmit: true },
							div(h3(submission.__id__), hr(),
								input({ dbjs: submission._files, render: renderFile }))));
			}
		)
	);

	div({ 'class': 'next-step', 'href': '#' },
		a("Continue to next step")
		);
};
