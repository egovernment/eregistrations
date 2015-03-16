'use strict';

var mixin         = require('es5-ext/object/mixin')
  , d             = require('d')
  , DOMRadio      = require('dbjs-dom/input/enum').Radio
  , RadioBtnGroup = require('./_inline-button-group')

  , createOption = DOMRadio.prototype.createOption
  , Radio;

module.exports = Radio = function (document, type/*, options*/) {
	var options = Object(arguments[2]);
	this.controlsOptions = Object(options.controls);
	DOMRadio.call(this, document, type, options);
};

Radio.prototype = Object.create(DOMRadio.prototype);
mixin(Radio.prototype, RadioBtnGroup.prototype);
Object.defineProperties(Radio.prototype, {
	constructor: d(Radio),
	createOption: d(function (name) {
		var dom = createOption.call(this, name);
		this.listItems[name] = dom = dom.firstChild;
		return dom;
	})
});
