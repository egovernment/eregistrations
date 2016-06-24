'use strict';

var db   = require('mano').db
  , user = db.User.prototype;

exports._parent = require('./business-process-guide-lomas');

exports['basic-info-tab'] = { class: { active: true } };

exports['user-guide-lomas-form'] = function () {
	form(
		section(
			fieldset(
				p("Address of your business?"),
				div({ class: 'input' },
					input({ class: 'user-guide-lomas-form-street', type: 'text' }),
					input({ class: 'user-guide-lomas-form-street-no', type: 'number' })
					),
				div({ class: 'user-guide-lomas-map', style: 'background-image: url(\'../img/map.png\')' }),
				p({ class: 'user-guide-lomas-info' },
					span(span({ class: 'fa fa-info-circle user-guide-lomas-info-icon' }, "Information:")),
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
						"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
						"Praesent porttitor dui a ante luctus gravida.")
			),
			fieldset(
				p("Business activity?"),
				ul({ class: 'form-elements' },
					['lomasActivity',
						'surfaceArea',
						'descriptionText',
						'questions'
						],
					function (name) {
						if (name === 'questions') {
							ul(
								['isLomas', 'isLomas', 'isLomasLong', 'isLomas', 'isLomas', 'isLomas',
									'isLomas', 'isLomasLong', 'isLomas', 'isLomas'],
								function (name) {
									li(
										{ class: 'input' },
										span({ class: 'user-guide-lomas-form-question' },
												user.getDescriptor(name).label),
										input({ control: { id: 'input-' + name }, dbjs: user.getObservable(name) })
									);
								}
							);
						} else {
							li(
								div({ class: 'input' },
									input({ control: { id: 'input-' + name },
										dbjs: user.getObservable(name),
											placeholder: user.getDescriptor(name).label }))
							);
						}
					}
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
