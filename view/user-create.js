'use strict';

var user = require('mano').db.User.prototype;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		return user.dataForm.toDOMForm(document);
	}
};
