'use strict';

var _  = require('mano').i18n.bind('Users Admin')
  , db = require('mano').db
  , user = require('mano').db.User.prototype;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		section({ class: 'section-primary' },
			h3(_("New user")),
			hr(),
			form(
				{ method: 'post', action: '/user-add/' },
				ul(
					{ class: 'form-elements' },
					li(field({ dbjs: user._firstName })),
					li(field({ dbjs: user._lastName })),
					li(field({ dbjs: user._roles })),
					li(field({ dbjs: user._institution })),
					li(field({ dbjs: user._email })),
					li(field({ dbjs: user._password })),
					li(field({ label: _("Repeat password"), dbjs: db.Password,
						required: true, name: 'password-repeat' }))
				),
				p({ class: 'submit-placeholder' },
					input({ type: 'submit', value: _("Save") }))
			));
	}
};
