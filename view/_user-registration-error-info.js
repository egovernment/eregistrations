// Guide not completed user info (Part A)

'use strict';

var _  = require('mano').i18n.bind('Registration');

exports.errorMsg = function (context, sendBackMsg) {
	return _if(or(not(eq(context.businessProcess._guideProgress, 1)),
			context.businessProcess._isSentBack),
		div({ class: 'error-main' },
			_if(not(eq(context.businessProcess._guideProgress, 1)),
				function () { return p(_("Please fill the Guide first")); },
					_if(context.businessProcess._isSentBack,
					function () { sendBackMsg(context); }.bind(context)))));
};
