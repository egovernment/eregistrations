/**
 * Controller for for both server and client.
 * Usage example for adding a new businessProcess:
 * var createBusinessProcess = require('eregistrations/controller/utils/create-business-process');
 * var validateDraftLimit = require('eregistrations/controller/utils/validate-draft-limit');
 *
 * exports['register-as-merchant'] = {
 *  submit: createBusinessProcess(db.BusinessProcessMerchant),
 *  redirectUrl: '/',
 *  validate: validateDraftLimit(db.BusinessProcessMerchant)};
 * }
 *
 */

'use strict';

var assign = require('es5-ext/object/assign');

// Common controller.
assign(exports, require('eregistrations/controller/my-account'));
