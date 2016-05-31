// Basic business process print data view

'use strict';

var _              = require('mano').i18n.bind('View: Print')
  , renderSections = require('./components/render-sections-json');

exports._parent = require('./print-base');
exports._match = 'businessProcess';

exports['print-page-title'] = function () {
	insert(_("Data of ${ businessProcessName }",
		{ businessProcessName: this.businessProcess._businessName }));
};

exports.main = {
	class: { 'entity-data-section-primary': true },
	content: function () {
		insert(renderSections(this.businessProcess.dataForms.dataSnapshot));
	}
};
