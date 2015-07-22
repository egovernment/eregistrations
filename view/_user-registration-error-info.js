// Guide not compleated user info (Part A)

'use strict';

var _  = require('mano').i18n.bind('Registration');

exports.errorMsg = function (sendBackMsg, businessProcess, context) {
	return _if(or(not(eq(businessProcess._guideProgress, 1)), businessProcess._isSentBack),
		div({ class: 'error-main' },
			_if(not(eq(businessProcess._guideProgress, 1)),
				function () { return p(_("Please fill the Guide first")); },
					_if(businessProcess._isSentBack,
					function () { sendBackMsg(context); }.bind(context)))));
};
