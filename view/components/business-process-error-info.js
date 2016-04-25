// Guide not completed user info (Part A)

'use strict';

var _            = require('mano').i18n.bind('Registration')
  , sentBackInfo = require('./business-process-sent-back-info');

exports.errorMsg = function (context) {
	var businessProcess = context.businessProcess
	  , guideProgress   = businessProcess._guideProgress
	  , isSentBack      = businessProcess._isSentBack;

	return _if(
		or(not(eq(guideProgress, 1)), isSentBack),
		div(
			{ class: 'info-main' },
			_if(not(eq(guideProgress, 1)), function () { return p(_("Please fill the Guide first")); }),
			_if(isSentBack, function () { return sentBackInfo(context); })
		)
	);
};
