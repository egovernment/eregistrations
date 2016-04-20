// Documents viewer

'use strict';

var includes           = require('es5-ext/array/#/contains')
  , camelToHyphen      = require('es5-ext/string/#/camel-to-hyphen')
  , endsWith           = require('es5-ext/string/#/ends-with')
  , nextTick           = require('next-tick')
  , isReadOnlyRender   = require('mano/client/utils/is-read-only-render')
  , _                  = require('mano').i18n.bind('User: Submitted')
  , db                 = require('mano').db
  , resolveArchivePath = require('../utils/resolve-document-archive-path')
  , docMimeTypes       = require('../utils/microsoft-word-doc-mime-types')
  , renderSection      = require('./components/render-sections-json').renderers.mainSection
  , syncHeight         = require('./utils/sync-height')
  , scrollBottom       = require('./utils/scroll-to-bottom')

  , _d = _;

var getFilePreview = function (file) {
	if (includes.call(docMimeTypes, file.type)) {
		return img({ class: 'submitted-preview-new-word-document',
			src: stUrl('/img/word-doc-icon.png') });
	}
	if (!isReadOnlyRender && (file.type === 'application/pdf')) {
		return iframe({ src: url('pdfjs/web/viewer.html?file=') + file.url.slice(1) });
	}
	return img({ zoomOnHover: true, src: or(file.previewUrl, file.thumbUrl) });
};

var resolveSnapshotArchivePath = function (businessProcess, snapshot, kind) {
	var name = 'business-process-document-archive-' + businessProcess.__id__ + '-';
	if (kind === 'certificate') name += 'certificate-';
	else if (kind === 'requirementUpload') name += 'requirement-';
	else if (kind === 'paymentReceiptUpload') name += 'receipt-';
	else throw new Error("Unrecognized document");
	name += camelToHyphen.call(snapshot.uniqueKey);
	return name + '.zip';
};

module.exports = function (context, sideContent) {
	var businessProcess = context.businessProcess
	  , kind = context.kind
	  , doc = context.document
	  , snapshot = context.dataSnapshot
	  , elem, data = {}, files;

	if ((kind === 'certificate') && !snapshot) {
		// Show certificate for not yet finalized request
		// As we don't have snapshot, we rely naturally on model
		data = {
			label: doc._label.map(function (label) { return _d(label, doc.getTranslations()); }),
			statusLog: doc.statusLog.ordered.toArray(),
			overviewSection: doc.overviewSection.toDOM(document, { disableHeader: true }),
			archiveUrl: resolveArchivePath(doc)
		};
		data.filesSize = doc.files.ordered._size;
		files = doc.files.ordered.map(function (file) {
			return {
				url: file.url,
				thumbUrl: file.thumb._url.map(function (url) {
					if (url) return stUrl(url);
				}),
				diskSize: file.diskSize,
				type: file.type,
				previewUrl: resolve(file._preview, '_url').map(function (url) {
					if (url) return stUrl(url);
				})
			};
		});
		data.firstFile = files._first;
		data.files = files.toArray();
		if (doc.dataForm.constructor !== db.FormSectionBase) {
			data.section = doc.dataForm.toDOM(document, {
				customFilter: function (resolved) {
					return !endsWith.call(resolved.observable.dbId, 'files/map');
				},
				disableHeader: true
			});
		}
	} else {
		// Rely on snapshot
		data = {
			label: snapshot.label,
			statusLog: snapshot.statusLog || [], // can be dynamic
			section: snapshot.section && renderSection(snapshot.section, 3),
			overviewSection: snapshot.overviewSection && renderSection(snapshot.overviewSection, 3),
			files: snapshot.files || [],
			archiveUrl: resolveSnapshotArchivePath(businessProcess, snapshot, kind)
		};
		data.filesSize = data.files.length;
		data.firstFile = data.files[0];
	}
	return [
		h2(data.label),
		_if(data.statusLog._length || data.statusLog.length, function () {
			var scrollableElem;
			var dom = section({ class: 'section-primary' },
				h2(_("Documents history")),
				scrollableElem = div({ class: 'submitted-user-history-wrapper' },
					table({ class: 'submitted-user-history' },
						tbody(data.statusLog, function (log) {
							th(log.label);
							td({ class: 'submitted-user-history-time' }, log.time);
							td(md(log.text));
						}))));
			nextTick(function () { scrollBottom(scrollableElem); });
			return dom;
		}),
		(data.section || data.overviewSection) && section({ class: 'section-primary' },
			h2(_("Data of certificate")),
			data.section,
			data.overviewSection),
		_if(data.filesSize,
			section({ class: 'submitted-preview-new' },
				div({ class: 'section-primary submitted-preview-new-document' },
					div({ class: 'container-with-nav' },
						h3(span({ class: 'submitted-preview-new-item-number' })),

						_if(gt(data.filesSize, 1),
							div({ class: 'submitted-preview-new-documents-navigation' },
								div(
									{ id: 'submitted-preview-new-navigation-top' },
									a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' },
										_("Previous"))),
									span(span({ class: 'current-index' }, "1"), " / ", data.filesSize),
									a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, _("Next")))
								)))),

					elem = ul({ id: 'doc-previews', class: 'submitted-preview-new-image-placeholder' },
						data.files, function (file) {
							li({ class: _if(eq(file, data.firstFile), 'active') }, getFilePreview(file));
						}),

					_if(gt(data.filesSize, 1),
						div({ class: 'submitted-preview-new-documents-navigation' },
							div({ id: 'submitted-preview-new-navigation-bottom' },
								a({ class: 'previous' }, span({ class: 'fa fa-chevron-circle-left' },
									_("Previous"))),
								span(span({ class: 'current-index' }, "1"), " / ", data.filesSize),
								a({ class: 'next' }, span({ class: 'fa fa-chevron-circle-right' }, _("Next"))),
								legacy('hashNavOrderedListControls',
									'submitted-preview-new-navigation-top', 'doc-previews',
									'doc-preview'),
								legacy('hashNavOrderedListControls',
									'submitted-preview-new-navigation-bottom', 'doc-previews',
									'doc-preview'),
								legacy('hashNavOrderedList', 'doc-previews', 'doc-preview')))),

					syncHeight(elem)),

				div({ class: 'section-primary submitted-preview-new-side-data' },
					a({
						class: 'button-main',
						href: _if(data.filesSize,
							_if(eq(data.filesSize, 1),
								resolve(data.firstFile, 'url'), '/' + data.archiveUrl)),
						download: _if(data.filesSize, _if(eq(data.filesSize, 1),
							resolve(data.firstFile, 'path'), data.archiveUrl))
					}, _("Download document")),
					sideContent)),
			p(_("This certificate does not have any physical file attached to it.")))
	];
};
