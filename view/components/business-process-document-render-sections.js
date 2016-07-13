'use strict';

var renderSections = require('./render-sections-json');

module.exports = function () {
	var businessProcess = this.businessProcess, requirementUpload = this.document.owner;

	return renderSections(businessProcess.dataForms.dataSnapshot, {
		filterSections: requirementUpload.relatedDataFormSections.toArray()
	});
};
