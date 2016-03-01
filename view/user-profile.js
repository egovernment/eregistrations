'use strict';

var _  = require('mano').i18n.bind('Registration')
  , db = require('mano').db
  , generateFormSections = require('./components/generate-form-sections')
  , baseUrl = url;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var url = baseUrl.bind(this.root);

		h1(_("User Profile"));
		div(
			{ class: 'section-primary' },
			h2(_("Account Information")),
			hr(),
			section(
				form({ action: url('profile'), method: 'post' },
					fieldset({
						class: 'form-elements',
						dbjs: this.user,
						names: ['firstName', 'lastName'],
						append: [
							li(field({ dbjs: this.user._email, disabled: true })),
							li(field({ dbjs: db.Password,
								label: _("Current password"), name: 'password',
								required: false })),
							li(field({ dbjs: db.Password,
								label: _("New password"),
								name: 'password-new', id: 'user-password-new',
								hint: _("Enter a new password (minimum 6 characters)."),
								required: false })),
							li(field({
								label: _("Repeat new password"),
								dbjs: db.Password,
								name: 'password-repeat'
							}))
						]
					}),
					p({ class: 'dbjs-component-message success-message' }),
					p({ class: 'submit-placeholder input' },
						input({ type: 'submit', value: _("Save") })))
			)
		);
		insert(exports._extraProfileForms(this));
	}
};

exports._extraProfileForms = function (context) {
	return _if(eq(context.user._currentRoleResolved, 'manager'), function () {
		return generateFormSections(context.user.managerDataForms.applicable);
	});
};
