// Official data view

'use strict';

var _                      = require('mano').i18n
  , dataView               = require('./components/business-process-data')
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
		insert(section({ class: 'section-primary' }, p(_("No data to display"))));
	}
};
