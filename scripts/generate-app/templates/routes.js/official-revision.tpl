/** Routes for the view.
 *  If a matcher is needed you can use this one:
 *   require('eregistrations/routes/utils/official-match-business-process')
 *  The parent routes for official accept step as string name or
 *  a function for a more complex step resolution See:
 *   require('eregistrations/routes/official')
 */
'use strict';

var assign = require('es5-ext/object/assign');

require('../../view/print-base');
require('../../view/user-base');

assign(exports, require('eregistrations/routes/official-revision')('${ appNameSuffix }'));

exports['/'] = require('../../view/${ appName }/business-processes-table');
exports['print-business-processes-list'] =
	require('../../view/${ appName }/print-business-processes-table');
