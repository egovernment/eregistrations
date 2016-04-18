'use strict';

var _                = require('mano').i18n.bind('User: Notifications')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , assign           = require('es5-ext/object/assign')
  , users            = require('../users/users');

module.exports = function (/*options*/) {
	var options      = normalizeOptions(arguments[1])
	  , notification = {};

	notification.trigger = users;

	notification.subject = _("M01 Your account in the service has been created");
	notification.text = _("M01 Account registration\n\n" + "Email: ${ email }");

	if (options.greeting == null) {
		notification.text = _("Email message greeting ${ fullName }") + "\n\n" + notification.text;
	}
	if (options.greeting) notification.text = options.greeting + "\n\n" + notification.text;

	if (options.signature == null) notification.text += "\n\n" + _("Email message signature") + "\n";
	if (options.signature) notification.text += "\n\n" + options.signature + "\n";

	notification.resolveGetters = true;
	notification.variables = {
		fullName: function () {
			return this.user.fullName;
		},
		email: function () {
			return this.user.email;
		}
	};

	delete options.greeting;
	delete options.signature;

	return assign(notification, options);
};
