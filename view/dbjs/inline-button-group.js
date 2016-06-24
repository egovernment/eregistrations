'use strict';

var d              = require('d')
  , generateScript = require('dom-ext/html-document/#/generate-inline-script')
  , getId          = require('dom-ext/html-element/#/get-id')
  , DOMInput       = require('dbjs-dom/input/_controls/radio')

  , createOption = DOMInput.prototype.createOption
  , Input;

module.exports = Input = function (document, type/*, options*/) {
	var options = Object(arguments[2]);
	this.controlsOptions = Object(options.controls);
	DOMInput.call(this, document, type, options);
};

Input.prototype = Object.create(DOMInput.prototype, {
	constructor: d(Input),
	classMap: d({}),
	current: d(null),
	_render: d(function (options) {
		this.dom = this.document.createElement('div');
		this.dom.setAttribute('class', options.class || 'inline-button-radio');
		this.classHandlerScript = generateScript.call(this.document, function (id, classMap) {
			var current, radio, radios;
			var onChange = function () {
				var nu, i;
				for (i = 0; (radio = radios[i]); ++i) {
					if (radio.checked) {
						nu = radio;
						break;
					}
				}
				if (nu === current) return;
				if (current) current.parentNode.removeClass(classMap[current.value] || 'success');
				if (nu) $(nu.parentNode).addClass(classMap[nu.value] || 'success');
				current = nu;
			};
			setTimeout(function self() {
				var container = $(id);
				if (!container) {
					setTimeout(self, 1000);
					return;
				}
				radios = container.getElementsByTagName('input');
				container.addEvent('change', function () { setTimeout(onChange, 0); });
				container.addEvent('click', function () { setTimeout(onChange, 0); });
				onChange();
			}, 0);
		}, getId.call(this.dom), this.classMap);
		this.dom.appendChild(this.classHandlerScript);
	}),
	createOption: d(function (value, labelTextDOM) {
		var dom = createOption.call(this, value, labelTextDOM, this.controlsOptions[value]);
		this.listItems[value] = dom = dom.firstChild;
		return dom;
	})
});
