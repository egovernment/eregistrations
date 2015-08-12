// Basic business process print data view
'use strict';

var _      = require('mano').i18n.bind('User')
  , db = require('mano').db
  , generateSections = require('eregistrations/view/components/generate-sections');

exports._parent = require('./print-base');

exports['print-page-title'] = function () {
	h2(_("Data of ${ businessProcessName }",
		{ businessProcessName: this.businessProcess._businessName }));
	p(new db.Date());
};

exports.main = function () {
	insert(generateSections(this.businessProcess.dataForms.applicable, {
		cssClass: ["section-primary", "entity-data-section-primary", "entity-data-section"]
	}));
};
