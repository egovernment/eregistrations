// A Input type for DynamicMinMax type fields.
// Use by creating new dynamic type like describer in eregistrations/model/dynamic-min-max and then
// link dom binding like so:
//
// require('eregistrations/view/dbjs/dynamic-min-max-input')(MinMaxType);

'use strict';

var d           = require('d')
  , memoize     = require('memoizee/plain')
  , DOMInput    = require('dbjs-dom/input/3.number').Input
  , DOMText     = require('dbjs-dom/text/1.base').Text

  , _render = DOMInput.prototype._render;

module.exports = memoize(function (MinMaxType/*, options*/) {
	var Input = function (document, ns/*, options*/) {
		DOMInput.apply(this, arguments);
	};

	Input.prototype = Object.create(DOMInput.prototype, {
		constructor: d(Input),
		_render: d(function () {
			_render.call(this);
			this.dom = this.observable.value._value.toDOMInput(document);
		})
	});

	var Text = function (document, ns/*, options*/) {
		var updateValue, resolvedValue;

		DOMText.apply(this, arguments);

		updateValue = function (event) {
			this.value = this.observable.value.resolvedValue;
		}.bind(this);

		resolvedValue = this.observable.value.resolveSKeyPath('resolvedValue').observable;
		resolvedValue.on('change', updateValue);
	};

	Text.prototype = Object.create(DOMText.prototype, {
		constructor: d(Text)
	});

	MinMaxType.DOMInput = Input;
	MinMaxType.DOMText = Text;
});
