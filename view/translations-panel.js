'use strict';

var _  = require('mano').i18n.bind('Registration');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		section(
			{ class: 'section-primary' },
			form(
				h2(_("Translations")),
				hr(),
				fieldset(
					{ class: 'form-elements i18n-panel' },
					ul(
						exports._translationsList(this),
						function (text, index) {
							var id = 'i18n-textarea-' + index;
							div(
								{ class: 'dbjs-input-component ' },
								label({ for: id }, text),
								div(
									{ class: 'input' },
									textarea({ id: id })
								)
							);
						}
					)
				),
				p(
					{ class: 'submit-placeholder' },
					input({ type: 'submit' })
				)
			)
		);
	}
};

exports._translationsList = Function.prototype;
