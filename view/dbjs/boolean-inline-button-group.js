'use strict';

var mixin            = require('es5-ext/object/mixin')
  , d                = require('d')
  , DOMRadio         = require('dbjs-dom/input/2.boolean').Radio
  , RadioButtonGroup = require('./inline-button-group')

  , Radio;

module.exports = Radio = function (document, type/*, options*/) {
	var options = Object(arguments[2]);
	this.controlsOptions = Object(options.controls);
	DOMRadio.call(this, document, type, options);
};

Radio.prototype = Object.create(DOMRadio.prototype);
mixin(Radio.prototype, RadioButtonGroup.prototype);
Object.defineProperties(Radio.prototype, {
	constructor: d(Radio),
	classMap: d({ '0': 'error' })
});
