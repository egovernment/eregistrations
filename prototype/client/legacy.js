'use strict';

document.createElement('section');
document.createElement('header');
document.createElement('dialog');

window.$ = require('mano-legacy');

require('mano-legacy/for-each');
require('mano-legacy/on-env-update');
require('mano-legacy/element#/get-by-class');
require('mano-legacy/radio-match');
require('mano-legacy/hash-nav');
require('mano-legacy/hash-nav-modal');
require('mano-legacy/hash-nav-ordered-list');
require('mano-legacy/hash-nav-ordered-list-controls');

require('../../client/legacy/form-section-state-helper');
require('../../common/legacy/date-controls');
