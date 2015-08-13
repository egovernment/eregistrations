// Guide not completed user info (Part A)

'use strict';

var _            = require('mano').i18n.bind('Registration')
  , sentBackInfo = require('./_business-process-sent-back-info');

exports.errorMsg = function (context) {
	return _if(or(not(eq(context.businessProcess._guideProgress, 1)),
			context.businessProcess._isSentBack),
		div({ class: 'error-main free-form' },
			_if(not(eq(context.businessProcess._guideProgress, 1)),
				function () { return p(_("Please fill the Guide first")); }),
			_if(context.businessProcess._isSentBack, function () { return sentBackInfo(context); })));
};
