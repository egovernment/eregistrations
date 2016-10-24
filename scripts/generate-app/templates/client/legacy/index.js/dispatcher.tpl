// Legacy function implementations

'use strict';

require('mano-legacy/html5');
require('mano-legacy/ie8-font-visibility-fix');
//Logs client errors to server logs
require('eregistrations/client/legacy/error-logger');

window.$ = require('mano-legacy');
require('mano-legacy/element#/class');
require('mano-legacy/hash-nav-ordered-list');
require('mano-legacy/hash-nav-ordered-list-controls');
require('mano-legacy/hash-nav-modal');
require('eregistrations/client/legacy/hash-nav-document-link');
