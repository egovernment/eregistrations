'use strict';

var documentsAndData = require('./_business-process-documents-and-data')
, userData = require('./_business-process-main-info');

exports._parent = require('./user-base');
exports._match = 'businessProcess';

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		userData(this.businessProcess);
		documentsAndData(this.businessProcess);
	}
};
