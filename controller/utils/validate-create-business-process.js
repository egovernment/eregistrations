'use strict';

var customError        = require('es5-ext/error/custom')
  , validateDraftLimit = require('./validate-draft-limit');

module.exports = function (bpType) {
	var limitValidator = validateDraftLimit(bpType);

	return function () {
		limitValidator.call(this, arguments);

		if (this.manager && this.manager !== this.user.manager) {
			throw customError("Cannot create a business process for this user", "USER_NOT_MANAGED");
		}
	};
};
