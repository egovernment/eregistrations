'use strict';

var generateSections = require('./components/generate-sections');

exports._parent = require('./business-process-submitted');
exports._match = 'businessProcess';

exports['tab-datas'] = { class: { active: true } };
exports['user-content'] = function (/*options*/) {
	var businessProcess = this.businessProcess;

	return [section({ class: 'section-primary' },
			div({ id: 'user-document', class: 'business-process-revision-selected-document' },
				div({ class: 'entity-data-section-side' },
					generateSections(businessProcess.dataForms.applicable, { viewContext: this })
					)
				)
		)];
};
