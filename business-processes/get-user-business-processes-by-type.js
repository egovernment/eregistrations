// Collection of all business processes of given type for given user which are not submitted

'use strict';

module.exports = function (user, bpType) {
	return user.businessProcesses.filter(function (bp) {
		if (bp.constructor !== bpType) return false;
		return (bp.constructor.prototype !== bp);
	}).filterByKey('isFromEregistrations', true).filterByKey('isSubmitted', false);
};
