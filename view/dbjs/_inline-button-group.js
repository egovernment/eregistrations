'use strict';

var assign   = require('es5-ext/object/assign')
  , d        = require('d')
  , autoBind = require('d/auto-bind')
  , DOMInput = require('dbjs-dom/input/_controls/radio')

  , createOption = DOMInput.prototype.createOption
  , onChange = Object.getPrototypeOf(DOMInput.prototype).onChange
  , Input;

module.exports = Input = function (document, type/*, options*/) {
	var options = Object(arguments[2]);
	this.controlsOptions = Object(options.controls);
	DOMInput.call(this, document, type, options);
};

Input.prototype = Object.create(DOMInput.prototype, assign({
	constructor: d(Input),
	classMap: d({}),
	current: d(null),
	_render: d(function () {
		this.dom = this.document.createElement('div');
		this.dom.setAttribute('class', 'inline-button-radio');
	}),
	createOption: d(function (value, labelTextDOM) {
		var dom = createOption.call(this, value, labelTextDOM, this.controlsOptions[value]);
		this.listItems[value] = dom = dom.firstChild;
		return dom;
	})
}, autoBind({
	onChange: d(function () {
		var value;
		onChange.call(this);
		value = this.inputValue;
		if (value === this.current) return;
		if (this.current) {
			this.listItems[this.current].classList.remove(this.classMap[this.current] || 'success');
		}
		this.current = value;
		if (!value) return;
		this.listItems[value].classList.add(this.classMap[value] || 'success');
	})
})));
