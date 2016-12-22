// Routes for the views.

'use strict';

var assign = require('es5-ext/object/assign');

require('../../view/base');
require('eregistrations/view/customizations/business-process-official-no-form');

assign(exports, require('eregistrations/routes/inspector')());
