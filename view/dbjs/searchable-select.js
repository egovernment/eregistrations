'use strict';

var d                = require('d')
  , DOMSelect        = require('dbjs-dom/input/6.object').Select
  , isReadOnlyRender = require('mano/client/utils/is-read-only-render')
  , chosen           = require('vanilla-chosen').Chosen

  , Input;

Input = function (document, type/*, options*/) {
	DOMSelect.apply(this, arguments);

	if (!isReadOnlyRender) {
		setTimeout(function (control) {
			chosen(control);
		}, 0, this.control);
	}
};

Input.prototype = Object.create(DOMSelect.prototype, {
	constructor: d(Input)
});

module.exports = Input;
