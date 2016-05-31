// Official data view

'use strict';

var dataView               = require('./components/business-process-data')
  , renderDataRevisionInfo = require('./components/business-process-data-review-info');

exports._parent = require('./business-process-official');

exports['tab-business-process-data'] = { class: { active: true } };
exports['tab-content'] = function () {
	insert(dataView(this, {
		prependContent: renderDataRevisionInfo(this),
		urlPrefix: '/' + this.businessProcess.__id__ + '/'
	}));
};
