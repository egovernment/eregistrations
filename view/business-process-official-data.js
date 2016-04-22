// Official data view

'use strict';

var generateSections = require('./components/generate-sections');

exports._parent = require('./business-process-official');

exports['tab-business-process-data'] = { class: { active: true } };
exports['tab-content'] = function () {
	var businessProcess = this.businessProcess;

	return [section({ class: 'section-primary' },
			div({ class: 'business-process-revision-selected-document' },
				div({ class: 'entity-data-section-side' },
					generateSections(businessProcess.dataForms.applicable, { viewContext: this })
					)
				)
		)];
};
