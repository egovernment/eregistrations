// Official data view

'use strict';

var dataView               = require('./components/business-process-data')
  , renderDataRevisionInfo = require('./components/business-process-data-review-info');

exports._parent = require('./business-process-official');

exports['tab-business-process-data'] = { class: { active: true } };
exports['tab-content'] = function () {
	if (this.dataSnapshot) {
		insert(dataView(this, {
			prependContent: renderDataRevisionInfo(this),
			urlPrefix: '/' + this.businessProcess.__id__ + '/'
		}));
	} else {
		insert(section({ class: 'section-primary' }, div(
			{ class: 'document-preview-data business-process-submitted-data' },
			list(this.businessProcess.dataForms.applicable, function (section) {
				return section.toDOM(document);
			})
		)));
	}
};
