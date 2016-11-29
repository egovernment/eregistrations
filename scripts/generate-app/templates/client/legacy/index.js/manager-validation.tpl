// Legacy function implementations.

'use strict';

require('mano-legacy/html5');
require('mano-legacy/ie8-font-visibility-fix');
//Logs client errors to server logs
require('eregistrations/client/legacy/error-logger');

window.$ = require('mano-legacy');

require('mano-legacy/element#/event');
require('domjs-ext/post-button.legacy');
require('mano-legacy/hash-nav-modal');
