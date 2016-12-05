'use strict';

var user = require('mano').db.User.prototype
  , _    = require('mano').i18n.bind('View: Users Admin');

exports._parent = require('./users-admin-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		return user.dataForm.toDOMForm(document, { prepend: h3(_("New User")) });
	}
};
