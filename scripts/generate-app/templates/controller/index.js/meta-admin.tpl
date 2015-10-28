// Controller for both server and client.

'use strict';

var assign = require('es5-ext/object/assign')
  , mano   = require('mano');

assign(exports, require('eregistrations/controller/user'));

// Translations
mano.i18nScanMap = require('../../../i18n-scan-map.generated');
exports['save-translations'] = require('eregistrations/controller/save-translations');
