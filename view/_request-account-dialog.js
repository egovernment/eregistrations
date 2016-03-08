'use strict';

var _ = require('mano').i18n.bind('Manager Validation');

module.exports = function (user) {
	return div(dialog(
		{ id: 'request-create-manager-account', class: 'dialog-modal' },
		header(
			h3(_('Create account for this client'))
		),
		form(
			{
				id: 'request-create-manager-account-form',
				class: 'dialog-body',
				method: 'post',
				action: url('request-create-manager-account', user.__id__)
			},
			h4(_if(user._isInvitationSent,
				_("Mind that to this user invitation was already sent. " +
					"Submission of this form will result in sending another email message " +
					"with different access token (one previously sent will be invalidated"))),
			ul(
				{ class: 'form-elements' },
				fieldset({
					class: 'form-elements',
					dbjs: user,
					names: ['email']
				})
			),
			footer(
				p(
					{ class: 'submit-placeholder' },
					input({ class: 'button-regular', type: 'submit', value: _("Send") })
				)
			)
		)
	));
};
