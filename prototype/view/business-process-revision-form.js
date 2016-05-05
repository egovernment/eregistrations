'use strict';

require('../../view/customizations/business-process-revision-processing');

module.exports = exports = require('../../view/business-process-revision-form');

exports._officialForm = function () {
	return this.businessProcess.certificates.map.docA.dataForm.toDOMForm(document);
};
