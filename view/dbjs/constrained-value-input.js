// A Input type for ConstrainedValue type fields.
// Use by creating new dynamic type like describer in eregistrations/model/constrained-value
// and then link dom binding like so:
//
// var NumberInput =  require('dbjs-dom/input/3.number').Input;
//
// db.Type.prototype.getDescriptor('constrainedProperty').DOMInput
//     = require('eregistrations/view/dbjs/constrained-value-input')(NumberInput);

'use strict';

var d              = require('d')
  , memoize        = require('memoizee/plain')
  , resolveOptions = require('dbjs-dom/input/utils/resolve-options')
  , defineProperty = Object.defineProperty;

module.exports = memoize(function (ValueInputType) {
	var Input = function (document, type/*, options*/) {
		var options         = resolveOptions(arguments[2])
		  , valueDescriptor = options.observable.value.getDescriptor('value');

		this.valueResolver = options.observable.value.getDescriptor('resolvedValue')._value_;
		options.name += '/value';
		options.dbOptions = valueDescriptor;
		options.observable =  options.observable.value.getObservable('value');

		ValueInputType.call(this, document, valueDescriptor.type, options);
	};

	Input.prototype = Object.create(ValueInputType.prototype, {
		constructor: d(Input),
		value: d.gs(function () {
			var mock = Object.create(this.observable.object), value;
			defineProperty(mock, 'value', d('cew', this.type.fromInputValue(this.inputValue)));
			value = this.valueResolver.call(mock, mock.database.observePassthru);
			return value;
		}, function (object) {
			var value = this.type.toInputValue(object.value);
			if (value == null) value = '';
			this.inputValue = value;
		})
	});

	return Input;
});
