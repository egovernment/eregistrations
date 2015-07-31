'use strict';

var scrollBottom     = require('./utils/scroll-to-bottom')
  , nextTick = require('next-tick')
  , _  = require('mano').i18n.bind('User Submitted')
  , curry = require('es5-ext/function/#/curry')
  , submission = require('./_submission');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var scrollableElem;

		h2(this.document.label);

		section(
			{ class: 'section-primary' },
			h2(_("Documents history")),
			scrollableElem = div(
				{ class: 'submitted-user-history-wrapper' },
				table(
					{ class: 'submitted-user-history' },
					console.log(this.document.files.ordered.size),
					tbody(
						this.document.statusLog.ordered,
						function (log) {
							th(log.label);
							td(log.time);
							td(log.text && log.text.split('\n').filter(Boolean).map(curry.call(p, 1)));
						}
					)
				)
			)
		);

		nextTick(function () { scrollBottom(scrollableElem); });

		section(
			{ class: 'submitted-preview-new' },
			div({ class: 'section-primary submitted-preview-new-document' }, submission(this.document)),
			div({ class: 'section-primary submitted-preview-new-side-data' },
				exports._documentSide(this))
		);
	}
};

exports._documentSide = Function.prototype;
