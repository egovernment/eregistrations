'use strict';

var _  = require('mano').i18n.bind('Users Admin')
  , db = require('mano').db;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var user = this.editedUser;
		section(
			{ class: 'section-primary' },
			div(
				{ class: 'entity-header' },
				h3([_("User"), ": ", user._fullName]),
				div(
					{ class: 'entity-header-actions' },
					postButton(
						{ action: url('user', user.__id__, 'delete'),
							buttonClass: 'entity-header-actions-remove-button',
							value: [i({ class: 'icon-trash' }), " ", _("Delete user")],
							confirm: _("Are you sure?") }
					)
				)
			),
			h4(db.Role.meta[user._currentRoleResolved].label),
			hr(),
			form(
				{ method: 'post', action: '/user/' + user.__id__ + '/' },
				fieldset(
					{ class: 'section-primary' },
					hr(),
					ul(
						{ class: 'form-elements' },
						li(field({ dbjs: user._firstName })),
						li(field({ dbjs: user._lastName })),
						li(field({ dbjs: user._roles })),
						li(field({ dbjs: user._email, disabled: true })),
						li(
							div(
								{ class: 'dbjs-input-component' },
								label({ for: 'new-password' }, _("New password")),
								div(
									{ class: 'input' },
									input({ dbjs: user._password, required: false, id: 'new-password' }),
									span(
										{ class: 'success-message empty' },
										span({ class: 'message-text' })
									)
								)
							)
						),
						li(field({ label: _("Repeat new password"), dbjs: db.Password,
							name: 'password-repeat' }))
					),
					p({ class: 'submit-placeholder' },
						input({ type: 'submit', value: _("Save") }))
				)
			)
		);
	}
};
