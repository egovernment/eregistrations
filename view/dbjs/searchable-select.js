'use strict';

var d                = require('d')
  , DOMSelect        = require('dbjs-dom/input/6.object').Select
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , isReadOnlyRender = require('mano/client/utils/is-read-only-render')
  , chosen           = require('vanilla-chosen').Chosen

  , Input;

Input = function (document, type/*, options*/) {
	var options = normalizeOptions(arguments[2]);

	DOMSelect.apply(this, arguments);

	if (!isReadOnlyRender && !options.readOnlyRender) {
		setTimeout(function () {
			chosen(this);
		}.bind(this.control), 0);
	}
};

Input.prototype = Object.create(DOMSelect.prototype, {
	constructor: d(Input)
});

module.exports = Input;
