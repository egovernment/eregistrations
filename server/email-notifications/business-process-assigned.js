'use strict';

var aFrom    = require('es5-ext/array/from')
  , _        = require('mano').i18n
  , template = require('es6-template-strings')
  , mailer   = require('mano/lib/server/mailer');

module.exports = function (dispatchersEmails, assignedOfficial, stepName) {
	return mailer({
		to: aFrom(dispatchersEmails),
		subject: _("New file arrived at ${ stepName } processing step", { stepName: stepName }),
		text: template(_("A new file has arrived at ${ stepName }. The file has been given " +
			"to ${ official }. Please connect to your dispatcher application if you want to " +
			"assign the file to an other operator."), {
			stepName: stepName,
			official: assignedOfficial.fullName
		})
	}).catch(function (e) {
		console.error("Cannot send assignment notification email");
		console.error(e.stack);
	});
};
