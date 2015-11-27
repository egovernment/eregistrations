'use strict';

var _ = require('mano').i18n.bind('User: Notifications');

exports.trigger = require('../users/users');
exports.subject = _("M01 Your account in the service has been created");

exports.text = _("Email message greeting ${ fullName }") + "\n\n"
	+ _("M01 Account registration\n\n" + "Email: ${ email }") + "\n\n" +
	_("Email message signature") + "\n";

exports.resolveGetters = true;
exports.variables = {
	fullName: function () {
		return this.user.fullName;
	},
	email: function () {
		return this.user.email;
	}
};
