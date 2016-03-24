'use strict';

var _        = require('mano').i18n
  , template = require('es6-template-strings')
  , mailer   = require('mano/lib/server/mailer');

module.exports = function (dispatcher, assignedOfficial) {
	return mailer({
		to: dispatcher.email,
		subject: _("New file arrived"),
		text: template(_("Email message greeting ${ fullName }") + "\n\n" +
				_("A new file has arrived. The file has been given to ${ official }. " +
				"Please connect to your dispatcher application if you want to assign the file " +
				"to an other operator."), {
				fullName: dispatcher.fullName,
				official: assignedOfficial.fullName
			})
	});
};
