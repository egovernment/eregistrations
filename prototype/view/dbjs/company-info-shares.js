'use strict';

var d  = require('d'),
	db = require('mano').db,
	ns = require('mano').domjs.ns;

Object.defineProperties(db.User.prototype.getDescriptor('shares'),
	{
		DOMInput: d(require('dbjs-dom/input/composites/line')),
		inputOptions: d({
			render: function () {
				var user = db.User.prototype;
				this.dom = ns.div(
					{ class: 'labelled-intputs-component' },
					ns.div(
						{ class: 'labelled-inputs-component-item' },
						ns.label({ for: 'number-of-shares' }, user.$get('shareholdersNumber').label + ":"),
						this.addItem(ns.input(
							{ type: 'text', dbjs: user._sharesAmount, id: 'number-of-shares' }
						))
					),
					ns.span('x'),
					ns.div(
						{ class: 'labelled-inputs-component-item' },
						ns.label({ for: 'value-of-share' }, user.$get('shareholderAmount').label + ":"),
						this.addItem(ns.input(
							{ type: 'text', dbjs: user._sharesValue, id: 'value-of-share' }
						))
					)
				);
			}
		})
	});
