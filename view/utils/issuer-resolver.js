'use strict';

var _  = require('mano').i18n.bind('View: Issued by')
  , db = require('mano').db;

module.exports = function (issuedBy) {
	if (issuedBy.constructor === db.User) {
		return _("User");
	}
	if (issuedBy.constructor === db.Institution) {
		return issuedBy.name;
	}
	return "";
};
