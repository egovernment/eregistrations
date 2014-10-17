'use strict';

var d = require('d'),
	db = require('mano').db,
	ns = require('mano').domjs.ns;

Object.defineProperties(db.User.prototype.getDescriptor('shares'),
	{
		DOMInput: d(require('dbjs-dom/input/composites/line')),
		inputOptions: d({
			render: function () {
				var user = db.User.prototype;
				this.dom = ns.div(
					{ class: 'computable-input-wrapper' },
					ns.div(
						{ class: 'computable-input' },
						ns.span(user.$get('shareholdersNumber').label + ":"),
						ns.input(
							{ type: 'text', dbjs: user._sharesAmount }
						)
					),
					ns.span('x'),
					ns.div(
						{ class: 'computable-input' },
						ns.span(user.$get('shareholderAmount').label + ":"),
						ns.input(
							{ type: 'text', dbjs: user._sharesValue }
						)
					)
				);
			}
		})
	});
