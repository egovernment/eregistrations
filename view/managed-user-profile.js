'use strict';

var _              = require('mano').i18n.bind('Registration')
  , readOnlyRender = require('./utils/read-only-render')
  , baseUrl = url;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var url = baseUrl.bind(this.root);

		h1(_("Managed User Profile"));
		div(
			{ class: 'section-primary' },
			h2(_("Managed Account Information")),
			section(
				form({ action: url('managed-profile'), method: 'post' },
					ul(
						{ class: 'form-elements' },
						li(field({ dbjs: this.user._firstName, label: _("clientFirstName") })),
						li(field({ dbjs: this.user._lastName, label: _("clientLastName") })),
						li(_if(this.user._isActiveAccount,
							field({ dbjs: this.user._email, label: _("clientEmail")
							  , modelRequired: false,
								render: readOnlyRender }),
							field({ dbjs: this.user._email, label: _("clientEmail")
							  , modelRequired: false  })))
					),
					p({ class: 'dbjs-component-message success-message' }),
					p({ class: 'submit-placeholder input' },
						input({ type: 'submit', value: _("Save") })))
			)
		);
	}
};
