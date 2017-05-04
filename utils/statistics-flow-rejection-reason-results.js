'use strict';

var _  = require('mano').i18n.bind('Routes: Statistics')
  , db = require('../db');

module.exports = function (reasons/*, opts */) {
	var opts = Object(arguments[1]);
	return reasons.map(function (reason) {
		var result = [], reasonsConcat = []
		  , prefix, uploadParent, upload;
		reason.rejectionReasons.forEach(function (reasonItem) {
			if (reasonItem.ownerType === 'processingStep') prefix = '';
			else if (reasonItem.ownerType === 'data') prefix = _('Data') + ' - ';
			else {
					try {
						uploadParent = reasonItem.path.slice(1, reasonItem.path.slice(1).indexOf('/') + 1);
						upload = reasonItem.path.slice(reasonItem.path.lastIndexOf('/') + 1);
						prefix = db[reason.service.type].prototype[uploadParent].map[upload].document.label;
					} catch (e) {
						//document's label that was rejected cannot be detected
						prefix = _('Document');
					}
					prefix += ' - ';
				}
			reasonItem.types.forEach(function (type) {
				if (type === 'other') {
					reasonsConcat.push(prefix + reasonItem.value);
					return;
				}
				reasonsConcat.push(
					prefix + db.RequirementUploadRejectReason.meta[type].label
				);
			});
		});
		result.push(reasonsConcat);
		result.push(reason.hasOnlySystemicReasons ? '*' : '');
		result.push(reason.occurrencesCount > 1 ? reason.occurrencesCount : '');
		result.push(reason.operator.name);
		result.push(reason.processingStep.label);
		result.push((new db.Date(reason.date.date)).toString());
		result.push(reason.service.businessName);
		if (opts.useBpId) {
			result.push(reason.service.id);
		}
		return result;
	});
};
