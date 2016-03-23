'use strict';

var _    = require('mano').i18n.bind('Users Admin')
  , user = require('mano').db.User.prototype;

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
					li(field({ dbjs: user._firstName })),
					li(field({ dbjs: user._lastName })),
					li(field({ dbjs: user._email }))
				),
				p({ class: 'submit-placeholder' },
					input({ type: 'submit', value: _("Save") }))
			));
	}
};
