'use strict';

var _  = require('mano').i18n.bind('Manager Validation')
  , readOnlyRender = require('./utils/read-only-render')
  , generateFormSections = require('./components/generate-form-sections')
  , activateManagerForm  = require('./components/activate-manager-form')
  , requestAccountDialog = require('./_request-account-dialog');

exports._parent = require('./user-base');
exports._match  = 'editedUser';

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var user = this.editedUser;
		var controls = { email: { render: readOnlyRender } };

		requestAccountDialog(user);
		section(
			{ class: 'section-primary' },
			div(
				{ class: 'entity-header' },
				h3([_("Manager"), ": ", user._fullName]),
				ul(
					{ class: 'entity-header-actions' },
					_if(not(user._isActiveAccount), li(a({
						class: 'actions-create',
						href: '#request-create-account'
					}, span(_('Create account for this client'))))),
					li(postButton(
						{ action: url('user', user.__id__, 'delete'),
							buttonClass: 'entity-header-actions-remove-button',
							value: [i({ class: 'icon-trash' }), " ", _("Delete user")],
							confirm: _("Are you sure?") }
					))
				)
			),
			activateManagerForm(user, true),
			form(
				{ method: 'post', action: '/user/' + user.__id__ + '/' },
				ul(
					{ class: 'form-elements' },
					fieldset({
						class: 'form-elements',
						dbjs: user,
						names: ['firstName', 'lastName', 'email', 'institution'],
						controls: controls
					})
				),
				p({ class: 'submit-placeholder' },
					input({ type: 'submit', value: _("Save") }))
			),
			generateFormSections(user.managerDataForms.applicable,
				{ cssSectionClass: 'section-primary-sub', headerRank: 4 })
		);
	}
};
