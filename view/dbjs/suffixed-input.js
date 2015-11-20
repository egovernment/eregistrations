// A Input type that appends a 'input-append' suffix span to its input.
// Use like this:
//
// var db              = require('../../db')
//   , StringLineInput = require('dbjs-dom/input/string/string-line').Input
//   , SufixedInput    = require('eregistrations/view/dbjs/suffixed-input')(StringLineInput);
//
// db.BusinessProcess.prototype.getOwnDescriptor('property').DOMInput = SufixedInput.Input;
//
// Comes also packed with legacy update script (SufixedInput.getInputCustomizeScript) that will
// update the displayed suffix based on type choice in other field in the same section.

'use strict';

var d             = require('d')
  , memoize       = require('memoizee/plain')
  , makeElement   = require('dom-ext/document/#/make-element')
  , camelToHyphen = require('es5-ext/string/#/camel-to-hyphen');

var getInputCustomizeScript = function (typeChoiceMeta, typeChoicePropertyKey, propertyKey) {
	return function (data) {
		var selectTypeId = normalize(data.fieldset.getItem('/' + typeChoicePropertyKey).input.dom)
			.getId();

		data.arrayResult.push(script(function (selectTypeId, typeMeta, inputKey) {
			var selectType = $(selectTypeId)
			  , spanAppend = $('span-append-' + inputKey)

			  , typeValue;

			$.onEnvUpdate(selectType, function () {
				if (selectType.value === 'other') {
					typeValue = null;
				} else {
					typeValue = typeMeta[selectType.value];
				}

				if (spanAppend) {
					spanAppend.toggle(typeValue);

					if (typeValue) {
						spanAppend.firstChild.data = typeValue;
					}
				}
			});
		}, selectTypeId, typeChoiceMeta, camelToHyphen.call(propertyKey)));
	};
};

module.exports = memoize(function (ParentInputType/* options */) {
	var _render = ParentInputType.prototype._render, Input;

	Input = function (document, type/*, options*/) {
		ParentInputType.apply(this, arguments);
	};

	Input.prototype = Object.create(ParentInputType.prototype, {
		constructor: d(Input),
		_render: d(function () {
			var el = makeElement.bind(this.document);
			_render.call(this);

			this.dom = el('span', { class: 'input-append' },
				this.control, el('span', {
					id: 'span-append-' + camelToHyphen.call(this.observable.key),
					class: 'add-on'
				}, ' '));
		})
	});

	return {
		Input: Input,
		getInputCustomizeScript: getInputCustomizeScript
	};
}, { normalizer: require('memoizee/normalizers/get-1')() });
