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
				this.dom = ns.table(
					ns.tbody(
						ns.tr(
							ns.td(
								ns.th(
									user.$get('shareholdersNumber').label
								)
							),
							ns.td(),
							ns.td(
								ns.th(
									user.$get('shareholderAmount').label
								)
							)
						),
						ns.tr(
							ns.td(
								ns.input(
									{ id: 'input-shares-amount',
										dbjs: user._sharesAmount }
								)
							),
							ns.td(" x "),
							ns.td(
								ns.input(
									{ control: { id: 'input-shares-value' },
										dbjs: user._sharesValue }
								)
							)
						),
						ns.tr(
							{ id: 'tr-shares-hint' },
							ns.td(
								{ colspan: 3 },
								user.$get('shares').inputHint
							)
						)
					)
				);
			}
		})
	});
