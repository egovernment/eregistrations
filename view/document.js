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

		console.log(this.document.label);

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
			{ class: 'submitted-preview' },
			submission(this.document)
		);

		section(
			{ class: 'submitted-preview' },
			source = div(
				{ class: 'section-primary submitted-preview-document' },
				div({ class: 'container-with-nav' },
					h3(span({ class: 'submitted-preview-item-number ' }, i("1")),
						span("Memorandum and articles of association lorem ipsum dolor sit")),
					div({ id: 'submitted-preview-navigation-top',
						class: 'submitted-preview-documents-navigation' },
						div(
							a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' }, "Previous")),
							span(span({ class: 'current-index' }, "1"),  " / 4"),
							a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, "Next"))
						))),
				ul({ id: 'doc-previews', class: 'submitted-preview-image-placeholder' },
					li(img({ zoomOnHover: true, src: '/uploads/doc-a-sub-file2.idoc.png.jpg' })),
					li(img({ zoomOnHover: true, src: '/uploads/doc-a-sub-file1.idoc.jpg' })),
					li(img({ zoomOnHover: true, src: '/uploads/doc-b-sub-file1.idoc.jpg' }))),
				legacy('hashNavOrderedList', 'doc-previews', 'doc-preview'),
				div({ id: 'submitted-preview-navigation-bottom',
					class: 'submitted-preview-documents-navigation' },
					div(
						a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' }, "Previous")),
						span(span({ class: 'current-index' }, "1"),  " / 4"),
						a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, "Next"))
					)),
				legacy('hashNavOrderedListControls', 'submitted-preview-navigation-top',
					'doc-previews', 'doc-preview'),
				legacy('hashNavOrderedListControls', 'submitted-preview-navigation-bottom',
					'doc-previews', 'doc-preview')
			),
			div({ class: 'section-primary submitted-preview-user-data' +
				' entity-data-section-side' },
				h2({ class: 'container-with-nav' }, "Application form"))
		);
	}
};
