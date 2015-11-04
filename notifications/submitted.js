'use strict';

var db = require('mano').db
  , _  = require('mano').i18n.bind('User: Notifications');

var businessProcessInstances = db.BusinessProcess.instances
	.filterByKey('isFromEregistrations', true);

exports.trigger = businessProcessInstances.filterByKeyPath('isSubmitted', true);

exports.subject = _("M02 Your application for registration has been received");
exports.text = _("Email message greeting ${ fullName }") + "\n\n"
	+ _("M02 Application send\n\n" + "Name of company: ${ nameOfCompany }\n\n"
		+ "Registrations: ${ registrations }\n\n"
		+ "Requirements: ${ requirements }") + "\n\n" +
	_("Email message signature") + "\n";

exports.resolveGetters = true;
exports.variables = {
	fullName: function () {
		return this.businessProcess.user.fullName;
	},
	registrations: function () {
		var result = [];
		this.businessProcess.registrations.requested.forEach(function (registration) {
			result.push("- " + registration.label);
		});
		return result.join("\n");
	},
	requirements: function () {
		var result = [];
		this.businessProcess.requirementUploads.applicable.forEach(function (requirementUpload) {
			result.push("- " + requirementUpload.document.label);
		});
		return result.join("\n");
	},
	nameOfCompany: function () {
		return this.businessProcess.businessName;
	}
};
