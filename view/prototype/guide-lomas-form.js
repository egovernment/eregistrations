'use strict';

var db = require('mano').db
  , user = db.User.prototype;

exports['basic-info-tab'] = { class: { active: true } };

exports['user-guide-lomas-form'] = function () {
	form(
		section(
			fieldset(
				p("Address of your business?"),
				div({ class: 'input' },
					input({ type: 'text' }),
					input({ type: 'number' })
					),
				div(
					img({ src: '/img/map.png' })
				),
				p({ class: 'user-guide-lomas-info' },
					span({ class: 'fa fa-info-circle user-guide-lomas-info-icon' }, "Information:"),
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
						"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
						"Praesent porttitor dui a ante luctus gravida.")
			),
			fieldset(
				p("Business activity?"),
				ul({ class: 'form-elements' },
					['businessActivity',
						'surfaceArea',
						'descriptionText',
						'questions'
						],
					function (name) {
						if (name === 'questions') {
							ul(
								['isLomas', 'isLomas', 'isLomas'],
								function (name) {
									li(
										{ class: 'input' },
										span(user.getDescriptor(name).label),
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
			p(input({ type: 'submit' })),
			p({ class: 'user-guide-lomas-info' },
				span({ class: 'fa fa-info-circle user-guide-lomas-info-icon' },
					"Information:"),
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
					"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. ")
		)
	);
};
