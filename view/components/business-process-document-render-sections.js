'use strict';

var renderSections = require('./render-sections-json');

module.exports = function () {
	var businessProcess   = this.businessProcess
	  , requirementUpload = this.document.owner
	  , dataSnapshot      = businessProcess.dataForms.dataSnapshot;

	if (dataSnapshot.resolved) {
		return renderSections(dataSnapshot, {
			allowedSectionKeys: requirementUpload.relatedDataFormSections.toArray()
		});
	}

	return list(businessProcess.dataForms.applicable, function (section) {
		return section.toDOM(document);
	});
};
