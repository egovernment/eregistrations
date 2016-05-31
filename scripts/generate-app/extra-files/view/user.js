// My Account application customisation for user view.

'use strict';

// Assure base customisations are loaded
require('./user-base');

module.exports = exports = require('eregistrations/view/user');

/**
 * Util for getting filtered businessProcesses of the user
 * var getSelectedBusinessProcesses =
 * require('eregistrations/business-processes/get-user-business-processes-by-type');
 */

exports._servicesBoxList = function () {
	/**
	 * Service box configuration example:
	 * {
	 * actionUrl: '/register-as-merchant/',
	 * buttonContent:  div({ class: 'user-account-service-button' },
	 * i({ class: 'fa fa-user' }), _("Register as individual trader")),
	 * content: span(_("Short description of merchant registration process")),
	 * disabledCondition: gtOrEq(getSelectedBusinessProcesses(this.user,
	 * db.BusinessProcessMerchant)._size, 5)
	 * }
	 *
	 */
	return [];
};
