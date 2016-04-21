// User: Basic business process print data

'use strict';

var _                = require('mano').i18n.bind('User')
  , generateSections = require('eregistrations/view/components/generate-sections');

exports._parent = require('./print-base');
exports._match = 'businessProcess';

exports['print-page-title'] = function () {
	insert(_("Data of ${ businessProcessName }",
		{ businessProcessName: this.businessProcess._businessName }));
};

exports.main = function () {
	insert(generateSections(this.businessProcess.dataForms.processChainApplicable, {
		cssClass: ["section-primary", "entity-data-section-primary", "entity-data-section"],
		viewContext: this
	}));
};