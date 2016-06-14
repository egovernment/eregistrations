'use strict';

var hyphenToCamel   = require('es5-ext/string/#/hyphen-to-camel')
  , officialMatcher = require('eregistrations/controller/utils/official-matcher');

module.exports = function (stepName) {
	return {
		formHtmlId: function () {
			return this.certificate.dataForm.domId;
		},
		match: function (businessProcessId, certificateName) {
			if (!officialMatcher.call(this, businessProcessId, stepName)) return false;

			this.certificate = this.businessProcess.certificates.map[hyphenToCamel.call(certificateName)];

			return this.certificate && this.processingStep.certificates.applicable.has(this.certificate);
		}
	};
};
