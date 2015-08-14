// Official data view

'use strict';

var businessProcessData = require('./_business-process-documents-and-data');

exports._parent = require('./business-process-official');

exports['business-process-official-details'] = { class: { active: true } };
exports['business-process-official-content'] = function () {
	businessProcessData(this.businessProcess, { urlPrefix: '/' + this.businessProcess.__id__ + '/' });
};
