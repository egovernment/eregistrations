// Official data view

'use strict';

var generateSections = require('./components/generate-sections');

exports._parent = require('./business-process-official');
exports._match = 'businessProcess';

exports['business-process-official-data'] = { class: { active: true } };
exports['business-process-official-content'] = function () {
	var businessProcess = this.businessProcess;

	return [section({ class: 'section-primary' },
			div({ id: 'user-document', class: 'business-process-revision-selected-document' },
				div({ class: 'entity-data-section-side' },
					generateSections(businessProcess.dataForms.applicable, { viewContext: this })
					)
				)
		)];
};
