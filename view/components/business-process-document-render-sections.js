'use strict';

var renderSections = require('./render-sections-json');

module.exports = function () {
	var businessProcess = this.businessProcess, requirementUpload = this.document.owner;

	return _if(requirementUpload.relatedDataFormSections._size, function () {
		return list(requirementUpload.relatedDataFormSections, function (section) {
			return section.toDOM(document);
		});
	}, function () {
		return renderSections(businessProcess.dataForms.dataSnapshot);
	});
};
