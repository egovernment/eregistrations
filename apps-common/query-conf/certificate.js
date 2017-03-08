'use strict';

var db           = require('../../db')
  , stringify    = JSON.stringify
  , certificates = {};

db.BusinessProcess.extensions.forEach(function (BpType) {
	BpType.prototype.certificates.map.forEach(function (certificate) {
		certificates[certificate.key] = true;
	});
});

module.exports = {
	name: 'certificate',
	ensure: function (value) {
		if (!value) return;

		if (!certificates[value]) {
			throw new Error("Unrecognized certificate value " + stringify(value));
		}

		return value;
	}
};
