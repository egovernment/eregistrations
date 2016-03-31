'use strict';

var user = require('mano').db.User.prototype
  , _  = require('mano').i18n.bind('Users Admin');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		return user.dataForm.toDOMForm(document, { prepend: h3(_("New User")) });
	}
};
