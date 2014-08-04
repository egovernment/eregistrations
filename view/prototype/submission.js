'use strict';

var db = require('mano').db,
	user = db.User.prototype;

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

	section(
		{ 'class': 'section-warning' },
		ul(
			li(
				a({ 'class': 'form-complition-link' },
					"Some required fields in the tab Fill the form have not been completed"
					)
			),
			li(
				a({ 'class': 'form-complition-link' },
					"Some documents have not been uploaded"
					)
			),
			li(
				a({ 'class': 'form-complition-link' },
					"Payment has not been cleared"
					)
			)
		)
	);

	section(
		{ 'class': 'section-primary' },
		form(
			fieldset(
				{ 'class': 'sworn-declaration' },
				h3("Sworn declaration"),
				hr(),
				field(
					{ dbjs: user._isAffidavitSigned,
						type: 'checkbox',
						label: " I declare I have read and understood all the conditions I have to " +
						"comply with and swear that the information provided in this application is true.",
						render: function (input, options) {
							return label(input, " ", options.label,
									span({ class: 'required-status' }, ''),
									span({ class: 'validation-status fa fa-check' }, 'Check')
									);
						}
						}
				)
			)
		)
	);

	div({ 'class': 'submit-user-button' },
		a({ 'href': ' ' }, "Send Your files")
		);
};
