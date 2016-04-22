'use strict';

var generateSections = require('./components/generate-sections');

exports._parent = require('./business-process-revision');
exports._match = 'businessProcess';

exports['business-process-datas'] = { class: { active: true } };
exports['official-revision-content'] = function (/*options*/) {
	var businessProcess = this.businessProcess;

	section(
		{ class: 'section-primary' },
		div(
			{ id: 'revision-document', class: 'business-process-revision-selected-document' },
			div(
				{ class: 'entity-data-section-side' },
				generateSections(businessProcess.dataForms.applicable, { viewContext: this })
			)
		)
	);
};
