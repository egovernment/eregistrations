'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options'),
	d = require('d'),
	Radio = require('eregistrations/view/dbjs/_enum-inline-button-group'),
	RuleRadio;

module.exports = RuleRadio = function (document, type/*, options*/) {
	var options = normalizeOptions(arguments[2]);
	if (!options.class) options.class = 'large-button-select';
	Radio.call(this, document, type, options);
};
RuleRadio.prototype = Object.create(Radio.prototype, {
	constructor: d(RuleRadio),
	classMap: d({ paused: 'success', yes: 'success', no: 'success' })
});
