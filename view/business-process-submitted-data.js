'use strict';

var generateSections = require('./components/generate-sections');

exports._parent = require('./business-process-submitted');
exports._match = 'businessProcess';

exports['tab-data'] = { class: { active: true } };
exports['tab-content'] = function (/*options*/) {
	var businessProcess = this.businessProcess;

	return [section({ class: 'section-primary' },
			div({ id: 'user-document', class: 'business-process-revision-selected-document' },
				div({ class: 'entity-data-section-side' },
					generateSections(businessProcess.dataForms.applicable, { viewContext: this })
					)
				)
		)];
};
