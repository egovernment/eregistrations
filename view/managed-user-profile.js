'use strict';

var _              = require('mano').i18n.bind('View: Manager')
  , readOnlyRender = require('./utils/read-only-render')
  , baseUrl        = url;

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
						li(field({ dbjs: this.user._firstName, label: _("Client's first name") })),
						li(field({ dbjs: this.user._lastName, label: _("Client's last name") })),
						li(_if(this.user._isActiveAccount,
							field({ dbjs: this.user._email, label: _("Client's email"),
								modelRequired: false,
								render: readOnlyRender }),
							field({ dbjs: this.user._email, label: _("Client's email"),
								modelRequired: false  })))
					),
					p({ class: 'dbjs-component-message success-message' }),
					p({ class: 'submit-placeholder input' },
						input({ type: 'submit', value: _("Save") })))
			)
		);
	}
};
