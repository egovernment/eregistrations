// Legacy function implementations

'use strict';

require('mano-legacy/html5');
require('mano-legacy/ie8-font-visibility-fix');

window.$ = require('mano-legacy');
$.legacyDb = require('./${ appNameHyphenedSuffix }-legacy-proto');

require('mano-legacy/live/input-mask');
require('eregistrations/client/legacy/refresh-guide');
require('mano-legacy/dbjs-observe-mock');
