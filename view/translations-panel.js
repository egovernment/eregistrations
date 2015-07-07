'use strict';

var _  = require('mano').i18n.bind('Registration'),
baseUrl = url,
toArray = require('es5-ext/object/to-array'),
isPluralKey = require('i18n2/is-plural-key'),
resolvePluralKey = require('i18n2/resolve-plural-key'),
locale = window.i18n;

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var url = baseUrl.bind(this.root), plural, pluralEdited;

		if (!exports._i18n()) {
			return;
		}

		section(
			{ class: 'section-primary' },
			form(
				{ id: 'form-translate', action: url('save-translations'), method: 'post' },
				h2(_("Translations")),
				hr(),
				fieldset(
					{ class: 'form-elements i18n-panel' },
					ul(
						toArray(exports._i18n),
						function (translation) {
							if (isPluralKey(translation[0])) {
								plural = resolvePluralKey(translation[0]);
								pluralEdited = locale[translation[0]];
								if (!pluralEdited) {
									pluralEdited = ['', ''];
								}
								div(
									{ class: 'dbjs-input-component ' },
									label(plural[0]),
									div({ class: 'input' },
										textarea({ cols: 60, name: translation[0] }, pluralEdited[0] || plural[0]))
								);
								div(
									{ class: 'dbjs-input-component ' },
									label(plural[1]),
									div({ class: 'input' },
										textarea({ cols: 60, name: translation[0] }, pluralEdited[1] || plural[1]))
								);
								return;
							}
							div(
								{ class: 'dbjs-input-component ' },
								label(translation[0]),
								div({ class: 'input' },
									textarea({ cols: 60,
										name: translation[0] }, locale[translation[0]] || translation[0]))
							);
						}
					)
				),
				p(
					{ class: 'submit-placeholder' },
					input({ type: 'submit', value: _("Save") })
				)
			)
		);
	}
};

exports._i18n = Function.prototype;
