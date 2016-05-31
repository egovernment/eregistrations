'use strict';

require('mano-legacy/html5');
window.$ = require('mano-legacy');

require('mano-legacy/for-each');
require('mano-legacy/on-env-update');
require('mano-legacy/element#/get-by-class');
require('mano-legacy/radio-match');
require('mano-legacy/hash-nav');
require('mano-legacy/hash-nav-modal');
require('mano-legacy/hash-nav-ordered-list');
require('mano-legacy/hash-nav-ordered-list-controls');
require('mano-legacy/hash-nav-tabs');
require('mano-legacy/ie8-font-visibility-fix');
require('mano-legacy/checkbox-toggle');
require('domjs-ext/post-button.legacy');

require('../../client/legacy/form-section-state-helper');
require('../../client/legacy/hash-nav-document-link');
require('../../common/legacy/date-controls');

// Assure empty mock
$.refreshGuide = Function.prototype;

$.legacyDb = { Currency: { format: function (value/*, options*/) {
	var options = Object(arguments[1]), intPart, numSep, result;
	if (isNaN(value)) return 'Invalid value';
	value = Number(value);
	if (!isFinite(value)) return String(value);
	value = value.toFixed(isNaN(options.fractionDigits) ? 2 : options.fractionDigits).split('.');
	intPart = value[0];
	result = value[1] || '';
	if (result) result = (options.decSep || '.') + result;
	numSep = options.numSep || '\'';
	while (intPart) {
		result = intPart.slice(-3) + result;
		intPart = intPart.slice(0, -3);
		if (intPart) result = numSep + result;
	}
	return (options.prefix || '') + result + (options.postfix || '');
}, symbol: "$", isoCode: "USD" }, Cost: { step: 0.01 }, locale: 'en' };

require('../../client/legacy/format-currency');
