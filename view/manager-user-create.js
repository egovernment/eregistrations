'use strict';

var _    = require('mano').i18n.bind('Users Admin')
	, db   = require('mano').db
  , user = db.User.prototype;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		section({ class: 'section-primary' },
			h3(_("New client")),
			form(
				{ method: 'post', action: '/user-add/' },
				ul(
					{ class: 'form-elements' },
					li(field({ dbjs: user._firstName })),
					li(field({ dbjs: user._lastName })),
					li(field({ dbjs: db.Email, name: user._email.dbId,
						label: user.getDescriptor('email').label }))
				),
				p({ class: 'submit-placeholder' },
					input({ type: 'submit', value: _("Save") }))
			));
	}
};
