'use strict';

exports.step = function () {
	section({ 'class': 'section-primary' },
		div(h3("Where do you want to withdraw your documents?"),
			hr(),
			form(ul({ 'class': 'form-elements fieldset' },
					li(label(span({ 'class': 'label' }, "Withdraw documents to:"
								), select(option("LoremIpsum Investemet Center"))
							)
						)
					)
				),
			p({ 'class': 'submit-placeholder' }, input({ 'type': 'submit' }, "Save"))
			)
		);

	section({ 'class': 'section-primary' },
		div(h3("Who will pick the certificates?"),
			hr(),
			form(ul({ 'class': 'form-elements fieldset' },
					li(label(span({ 'class': 'label' }, "The following person:"),
							ul({ 'class': 'radio' },
								li(label(input({ 'type': 'radio' }), "I will pick the certificates.")),
								li(label(input({ 'type': 'radio' }),
									"The following person will pick the certificates :"))
								)
							)
						)
					)
				),
			p({ 'class': 'submit-placeholder' }, input({ 'type': 'submit' }, "Save"))
			)
		);

	section({ 'class': 'section-primary' },
		div(h3("Preview of your application"), hr(),
				a({ 'class': 'application-preview ' }, "Preview of application")
			)
		);
};
