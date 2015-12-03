// A Input type for DynamicCurrency type fields.
// Use by creating new dynamic currency like describer in eregistrations/model/dynamic-currency
// and then link dom binding like so:
//
// require('eregistrations/view/dbjs/dynamic-currency-input')(CurrencyType,
//     'dynamicCurrencyTypeKeyPath');

'use strict';

var db          = require('mano').db
  , d           = require('d')
  , memoize     = require('memoizee/plain')
  , makeElement = require('dom-ext/document/#/make-element')
  , DOMInput    = require('dbjs-dom/input/3.number').Input
  , DOMText        = require('dbjs-dom/text/1.base').Text

  , _render = DOMInput.prototype._render;

module.exports = memoize(function (Currency, currencyTypeKeyPath/* options */) {
	var Input = function (document, ns/*, options*/) {
		DOMInput.apply(this, arguments);
	};

	Input.prototype = Object.create(DOMInput.prototype, {
		constructor: d(Input),
		_render: d(function () {
			var el       = makeElement.bind(this.document)
			  , master   = this.observable.value.master
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
				this.observable.value._amount.toDOMInput(document, { DOMInput: db.Number.DOMInput })
			);
		})
	});

	var Text = function (document, ns/*, options*/) {
		var updateValue, currencyType, amount;

		DOMText.apply(this, arguments);

		updateValue = function (event) {
			this.value = this.observable.value;
		}.bind(this);

		currencyType = this.observable.value.master.resolveSKeyPath(currencyTypeKeyPath).observable;
		amount = this.observable.value.resolveSKeyPath('amount').observable;

		currencyType.on('change', updateValue);
		amount.on('change', updateValue);
	};

	Text.prototype = Object.create(DOMText.prototype, {
		constructor: d(Text)
	});

	Currency.DOMInput = Input;
	Currency.DOMText = Text;
});
