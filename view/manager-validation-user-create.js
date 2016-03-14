'use strict';

var _    = require('mano').i18n.bind('Users Admin')
  , user = require('mano').db.User.prototype;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		section({ class: 'section-primary' },
			h3(_("New manager")),
			form(
				{ method: 'post', action: '/user-add/' },
				fieldset({
					class: 'form-elements',
					dbjs: user,
					names: ['firstName', 'lastName']
				}),
				p({ class: 'submit-placeholder' },
					input({ type: 'submit', value: _("Save") }))
			));
	}
};
