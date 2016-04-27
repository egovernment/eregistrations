// Official data view

'use strict';

var dataView = require('./components/business-process-data');

exports._parent = require('./business-process-official');

exports['tab-business-process-data'] = { class: { active: true } };
exports['tab-content'] = function () {
	var businessProcess = this.businessProcess;

	insert(dataView(businessProcess.dataForms.applicable, {
		urlPrefix: '/' + businessProcess.__id__ + '/'
	}));
};
