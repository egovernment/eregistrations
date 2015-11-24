// A Input type for DynamicCurrency type fields.
// Use by creating new dynamic currency like describer in eregistrations/model/dynamic-currency
// and then link dom binding like so:
//
// require('eregistrations/view/dbjs/dynamic-currency-input')('dynamicCurrencyTypeKeyPath');

'use strict';

var db          = require('mano').db
  , d           = require('d')
  , memoize     = require('memoizee/plain')
  , makeElement = require('dom-ext/document/#/make-element')
  , DOMInput    = require('dbjs-dom/input/3.number').Input

  , _render = DOMInput.prototype._render;

module.exports = memoize(function (currencyTypeKeyPath/* options */) {
	var Input = function (document, ns/*, options*/) {
		DOMInput.apply(this, arguments);
	};

	Input.prototype = Object.create(DOMInput.prototype, {
		constructor: d(Input),
		_render: d(function () {
			var el           = makeElement.bind(this.document)
			  , master       = this.observable.value.master
			  , currencyType = master.resolveSKeyPath(currencyTypeKeyPath).observable;

			_render.call(this);
			this.dom = el(
				'span',
				{ class: 'input-prepend' },
				_if(currencyType, el(
					'span',
					{ class: 'add-on' },
					currencyType
				)),
				this.observable.value._amount.toDOMInput(document, { DOMInput: db.Number.DOMInput })
			);
		})
	});

	return Input;
});
