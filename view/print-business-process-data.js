// Basic business process print data view
'use strict';

var _      = require('mano').i18n.bind('User')
  , format = require('es5-ext/date/#/format')
  , generateSections = require('eregistrations/view/components/generate-sections');

exports._parent = require('./print-base');

exports['print-page-title'] = function () {
	h2(_("Data of"), " ", this.businessProcess._businessName);
	p(format.call(new Date(), '%d/%m/%Y'));
};

exports.main = function () {
	insert(generateSections(this.businessProcess.dataForms.processChainApplicable, {
		cssClass: ["section-primary", "entity-data-section-primary", "entity-data-section"]
	}));
};
