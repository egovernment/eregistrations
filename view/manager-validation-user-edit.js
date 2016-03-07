'use strict';

var _  = require('mano').i18n.bind('Users Admin')
  , readOnlyRender = require('./utils/read-only-render')
  , generateFormSections = require('./components/generate-form-sections');

exports._parent = require('./user-base');
exports._match  = 'editedUser';

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var user = this.editedUser;
		var controls = { email: { render: readOnlyRender } };
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
			hr(),
			form(
				{ method: 'post', action: '/user/' + user.__id__ + '/' },
				ul(
					{ class: 'form-elements' },
					fieldset({
						class: 'form-elements',
						dbjs: user,
						names: ['isManagerActive', 'firstName', 'lastName', 'email', 'institution'],
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
