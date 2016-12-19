'use strict';

var renderSections = require('./render-sections-json');

module.exports = function () {
	var businessProcess   = this.businessProcess
	  , requirementUpload = this.document.owner
	  , dataSnapshot      = businessProcess.dataForms.dataSnapshot;

	return _if(dataSnapshot.resolved, renderSections(dataSnapshot, {
		allowedSectionKeys: requirementUpload.relatedDataFormSections.toArray()
	}), list(businessProcess.dataForms.applicable, function (section) {
		return section.toDOM(document);
	}));
};
