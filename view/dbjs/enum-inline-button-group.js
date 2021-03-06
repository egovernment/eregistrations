'use strict';

var assign        = require('es5-ext/object/assign')
  , forEach       = require('es5-ext/object/for-each')
  , mixin         = require('es5-ext/object/mixin')
  , d             = require('d')
  , autoBind      = require('d/auto-bind')
  , DOMRadio      = require('dbjs-dom/input/enum').Radio
  , RadioBtnGroup = require('./inline-button-group')

  , createOption = DOMRadio.prototype.createOption
  , reload =  DOMRadio.prototype.reload
  , Radio;

module.exports = Radio = function (document, type/*, options*/) {
	var options = Object(arguments[2]);
	this.controlsOptions = Object(options.controls);
	var cb = function (itemMeta, name) {
		if (itemMeta.htmlClass) this[name] = itemMeta.htmlClass;
	};
	this.classMap = {};
	if (type.meta.forEach) type.meta.forEach(cb, this.classMap);
	else forEach(type.meta, cb, this.classMap);
	DOMRadio.call(this, document, type, options);
};

Radio.prototype = Object.create(DOMRadio.prototype);
mixin(Radio.prototype, RadioBtnGroup.prototype);
Object.defineProperties(Radio.prototype, assign({
	constructor: d(Radio),
	createOption: d(function (name) {
		var dom = createOption.call(this, name);
		this.listItems[name] = dom = dom.firstChild;
		return dom;
	})
}, autoBind({
	reload: d(function () {
		reload.apply(this, arguments);
		this.dom.insertBefore(this.classHandlerScript, this.dom.firstChild);
	})
})));
