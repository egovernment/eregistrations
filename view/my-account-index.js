'use strict';

var _ = require('mano').i18n.bind('User');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		section({ class: 'section-primary free-form' },
			h1(_("Welcome to your account")),
			hr(),
			p(_("From here, you can"), ":"),
			ol(li(_("start a new service online")),
				li(_("see your draft, in process or processed applications")),
				li(_("see and modify the data and documents linked to your applications"))));
	}
};
