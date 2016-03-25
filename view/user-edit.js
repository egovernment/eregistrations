'use strict';

var _  = require('mano').i18n.bind('Users Admin');

exports._parent = require('./user-base');
exports._match  = 'editedUser';

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var user = this.editedUser;
		section(
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
				),
				user.dataForm.toDOMForm(document)
			)
		);
	}
};
