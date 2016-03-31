'use strict';

var _  = require('mano').i18n.bind('Users Admin');

exports._parent = require('./user-base');
exports._match  = 'editedUser';

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var user = this.editedUser, prepend, options = {};

		prepend = div(
			{ class: 'entity-header' },
			h3(_("Edit user: ${ fullName }", { fullName: user._fullName })),
			div(
				{ class: 'entity-header-actions' },
				postButton(
					{ action: url('user', user.__id__, 'delete'),
						buttonClass: 'entity-header-actions-remove-button',
						value: [i({ class: 'icon-trash' }), " ", _("Delete user")],
						confirm: _("Are you sure?") }
				)
			)
		);

		options.inputOptions = { password: { modelRequired: false } };
		options.customize = function (customizeData) {
			customizeData.container.insertBefore(prepend, customizeData.container.firstChild);
		};

		return user.dataForm.toDOMForm(document, options);
	}
};
