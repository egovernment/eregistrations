'use strict';

var _    = require('mano').i18n.bind('View: Manager')
  , db   = require('mano').db
  , user = db.User.prototype;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		section({ class: 'section-primary' },
			h3(_("New client")),
			div({ class: 'section-primary-legend' }, md(_("Please fill the form below to create " +
				"the account of your client where all the requests, documents and data will be stored."))),
			form(
				{ method: 'post', action: '/user-add/' },
				ul(
					{ class: 'form-elements' },
					li(field({ dbjs: user._firstName, label: _("Client's first name") })),
					li(field({ dbjs: user._lastName, label: _("Client's last name") })),
					li(field({ dbjs: db.Email, name: user._email.dbId,
						label: _("Client's email"), hint: _("This email is optional. " +
							"If you fill it, the client will not receive any notifications until your decide," +
							" later, to create his/her account.") }))
				),
				p({ class: 'submit-placeholder' },
					input({ type: 'submit', value: _("Save") }))
			));
	}
};
