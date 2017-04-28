'use strict';

var db = require('../db');

module.exports = function (reasons) {
	return reasons.map(function (reason) {
		var result = [], reasonsConcat = [];
		reason.rejectionReasons.forEach(function (reasonItem) {
			reasonItem.types.forEach(function (type) {
				reasonsConcat.push(type);
				if (type === 'other' && reasonItem.value){
					reasonsConcat.push(reasonItem.value);
				}
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
