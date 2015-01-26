'use strict';

var db = require('mano').db
  , user = db.User.prototype;

exports['basic-info-tab'] = { class: { 'user-guide-lomas-basic-nav-active': false } };
exports['additional-info-tab'] = { class: { 'user-guide-lomas-basic-nav-active': true } };

exports['user-guide-lomas-basic'] = function () {
	form(
		section(
			fieldset(
				ul(
					{ class: 'user-guide-lomas-basic-complement' },
					['surfaceArea',
						'inventory',
						'businessActivity'],
					function (name) {
						li(
							div(span(user.getDescriptor(name).label),
								input({ control: { id: 'input-' + name },
									dbjs: user.getObservable(name) }),
								span(user.getDescriptor(name).inputHint))
						);
					}
				)
			),
			fieldset(
				{ class: 'form-elements' },
				ul(
					{ class: 'user-guide-lomas-basic-complement' },
					li(
						div(input({ control: { id: 'input-' + user.notification },
							dbjs: user._notification }))
					),
					li(
						p('Lorem ipsum dolor ist amet:'),
						ul(
							['isLomas', 'isLomas'],
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
			p(input({ type: 'submit' })),
			p(span({ class: 'fa fa-info-circle' }, "Information:"),
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
					"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. ")
		)
	);
};
