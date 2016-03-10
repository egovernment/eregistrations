'use strict';

var _              = require('mano').i18n.bind('Registration')
  , readOnlyRender = require('./utils/read-only-render')
  , baseUrl = url;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var url = baseUrl.bind(this.root);
		var controls = { email: { render: readOnlyRender } };
		h1(_("Managed User Profile"));
		div(
			{ class: 'section-primary' },
			h2(_("Managed Account Information")),
			section(
				form({ action: url('profile'), method: 'post' },
					fieldset({
						class: 'form-elements',
						dbjs: this.user,
						names: ['firstName', 'lastName', 'email'],
						controls: controls
					}),
					p({ class: 'dbjs-component-message success-message' }),
					p({ class: 'submit-placeholder input' },
						input({ type: 'submit', value: _("Save") })))
			)
		);
	}
};
