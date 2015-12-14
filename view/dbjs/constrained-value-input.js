// A Input type for ConstrainedValue type fields.
// Use by creating new dynamic type like describer in eregistrations/model/constrained-value
// and then link dom binding like so:
//
// var NumberInput =  require('dbjs-dom/input/3.number').Input;
//
// db.Type.prototype.getDescriptor('constrainedProperty').DOMInput
//     = require('eregistrations/view/dbjs/constrained-value-input')(NumberInput);

'use strict';

var d       = require('d')
  , memoize = require('memoizee/plain');

module.exports = memoize(function (ValueInputType) {
	var _render = ValueInputType.prototype._render, Input;

	Input = function (document, ns/*, options*/) {
		ValueInputType.apply(this, arguments);
	};

	Input.prototype = Object.create(ValueInputType.prototype, {
		constructor: d(Input),
		_render: d(function () {
			_render.call(this);
			this.dom = this.observable.value._value.toDOMInput(document);
		})
	});

	return Input;
});
