'use strict';

var db = require('mano').db
  , user = db.User.prototype;

exports._parent = require('./business-process-guide-lomas');

exports['additional-info-tab'] = { class: { active: true } };

exports['user-guide-lomas-form'] = function () {
	form(
		section(
			{ class: 'user-guide-lomas-form-complement' },
			fieldset(
				table(
					{ class: 'user-guide-lomas-form-complement-table' },
					tbody(
						tr(
							td(user.getDescriptor('surfaceArea').label),
							td({ class: 'user-guide-lomas-controls-cell' },
									input({ control: { id: 'input-' + user._surfaceArea },
										dbjs: user._surfaceArea })),
							td(user.getDescriptor('surfaceArea').inputHint)
						),
						tr(
							td(user.getDescriptor('inventory').label),
							td({ class: 'user-guide-lomas-controls-cell' },
									input({ control: { id: 'input-' + user._inventory },
										dbjs: user._inventory })),
							td(span({ class: 'user-guide-inventory-button' },
									a({ href: '#inventory' },
										span({ class: 'fa fa-calculator user-guide-inventory-icon' },
												"Calculator"),
										span({ class: 'user-guide-inventory-label' },
												"Calculate"))),
								a({ class: 'user-guide-lomas-inventory-print' },
										span({ class: 'fa fa-print' }, "Print")))
						),
						tr(
							td(user.getDescriptor('businessActivity').label),
							td({ colspan: 2, class: 'user-guide-lomas-controls-cell' },
									input({ control: { id: 'input-' + user._businessActivity },
										dbjs: user._businessActivity }))
						)
					)
				)
			),
			fieldset(
				{ class: 'form-elements' },
				ul(
					{ class: 'user-guide-lomas-form-complement-list' },
					li(
						input({ control: { id: 'input-' + user.notification },
							dbjs: user._notification })
					),
					li(
						p('Lorem ipsum dolor ist amet:'),
						ul(
							['isLomas', 'isLomas', 'isLomas', 'isLomas'],
							function (name) {
								li(
									{ class: 'input' },
									span(user.getDescriptor(name).label),
									input({ control: { id: 'input-' + name }, dbjs: user.getObservable(name) })
								);
							}
						)
					)
				)
			)
		),
		div(
			{ class: 'user-guide-lomas-form-components-submit' },
			p({ class: 'user-guide-lomas-form-components-submit-container' },
					input({ type: 'submit' })),
			p({ class: 'user-guide-lomas-info' },
					span(span({ class: 'fa fa-info-circle user-guide-lomas-info-icon' },
						"Information:")),
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
					"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. ")
		)
	);
};
