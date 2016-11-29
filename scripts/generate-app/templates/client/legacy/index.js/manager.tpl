// Legacy function implementations

'use strict';

require('mano-legacy/html5');
require('mano-legacy/ie8-font-visibility-fix');
//Logs client errors to server logs
require('eregistrations/client/legacy/error-logger');

window.$ = require('mano-legacy');
require('mano-legacy/confirm-submit');
require('mano-legacy/live/input-mask');
