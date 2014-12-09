'use strict';

var noop        = require('es5-ext/function/noop')
  , zoomOnHover = require('dom-ext/html-element/#/zoom-on-hover')
  , delay       = require('timers-ext/delay')
  , isVisual    = require('../utils/is-visual');

module.exports = function (domjs) {
	var directives = domjs.getDirectives('img');
	if (!isVisual) {
		directives.zoomOnHover = noop;
		return;
	}
	directives.zoomOnHover = delay(function () {
		if (!this.parentNode) {
			throw new TypeError('Cannot configure zoomOnHover. Image is not within document');
		}
		zoomOnHover.call(this.parentNode);
	});
};
