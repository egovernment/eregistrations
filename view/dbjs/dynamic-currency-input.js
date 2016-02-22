// A Input type for DynamicCurrency type fields.
// Use by creating new dynamic currency like describer in eregistrations/model/dynamic-currency
// and then link dom binding like so:
//
// require('eregistrations/view/dbjs/dynamic-currency-input')(CurrencyType,
//     'dynamicCurrencyTypeKeyPath');

'use strict';

var d                      = require('d')
  , memoize                = require('memoizee/plain')
  , defineConstrainedInput = require('./constrained-value-input')
  , makeElement            = require('dom-ext/document/#/make-element')
  , DOMInput               = require('dbjs-dom/input/3.number').Input
  , DOMText                = require('dbjs-dom/text/1.base').Text;

module.exports = memoize(function (Currency, currencyTypeKeyPath/* options */) {
	var ConstrainedInput = defineConstrainedInput(DOMInput)
	  , _render          = ConstrainedInput.prototype._render;

	var Input = function (document, type/*, options*/) {
		ConstrainedInput.apply(this, arguments);
	};

	Input.prototype = Object.create(ConstrainedInput.prototype, {
		constructor: d(Input),
		_render: d(function () {
			var el       = makeElement.bind(this.document)
			  , master   = this.observable.object.master
			  , Currency = master.resolveSKeyPath(currencyTypeKeyPath).observable;

			_render.call(this);
			this.dom = el(
				'span',
				{ class: 'input-prepend' },
				_if(Currency, el(
					'span',
					{ class: 'add-on' },
					Currency
				)),
				this.control
			);
		})
	});

	var Text = function (document, ns/*, options*/) {
		var updateValue, currencyType, value;

		DOMText.apply(this, arguments);

		updateValue = function (event) {
			this.value = this.observable.value;
		}.bind(this);

		currencyType = this.observable.value.master.resolveSKeyPath(currencyTypeKeyPath).observable;
		value = this.observable.value.resolveSKeyPath('value').observable;

		currencyType.on('change', updateValue);
		value.on('change', updateValue);
	};

	Text.prototype = Object.create(DOMText.prototype, {
		constructor: d(Text)
	});

	Currency.DOMInput = Input;
	Currency.DOMText = Text;
});
