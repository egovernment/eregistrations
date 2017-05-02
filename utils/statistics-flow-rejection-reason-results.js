'use strict';

var db = require('../db');

module.exports = function (reasons) {
	return reasons.map(function (reason) {
		var result = [], reasonsConcat = []
		  , prefix, prefixCount = 0;
		reason.rejectionReasons.forEach(function (reasonItem) {
			if (reasonItem.ownerType === 'processingStep') prefix = '';
			else if (reasonItem.ownerType === 'data') prefix = 'Data - ';
			else {
				prefixCount++;
				prefix = 'Document ' + prefixCount + ' - ';

			}
			reasonItem.types.forEach(function (type) {
				if (type === 'other') {
					reasonsConcat.push(prefix + reasonItem.value);
					return;
				}
				reasonsConcat.push(prefix + db.RequirementUploadRejectReason.meta[type].label);
			});
		});
		result.push(reasonsConcat);
		result.push(reason.hasOnlySystemicReasons ? '*' : '');
		result.push('');
		result.push(reason.operator.name);
		result.push(reason.processingStep.label);
		result.push((new db.Date(reason.date.date)).toString());
		result.push(reason.service.businessName);
		return result;
	});
};
