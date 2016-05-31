'use strict';

var camelToHyphen      = require('es5-ext/string/#/camel-to-hyphen')
  , endsWith           = require('es5-ext/string/#/ends-with')
  , touchObservable    = require('domjs-ext/lib/unbind-injected')
  , _                  = require('mano').i18n.bind('View: Component: Documents')
  , db                 = require('../../db')
  , resolveArchivePath = require('../../utils/resolve-document-archive-path')
  , renderSection      = require('../components/render-sections-json').renderers.mainSection

  , _d = _;

var resolveSnapshotArchivePath = function (businessProcess, snapshot, kind) {
	var name = 'business-process-document-archive-' + businessProcess.__id__ + '-';
	if (kind === 'certificate') name += 'certificate-';
	else if (kind === 'requirementUpload') name += 'requirement-';
	else if (kind === 'paymentReceiptUpload') name += 'receipt-';
	else throw new Error("Unrecognized document");
	name += camelToHyphen.call(snapshot.uniqueKey);
	return name + '.zip';
};

module.exports = function (context) {
	var businessProcess = context.businessProcess, kind = context.documentKind
	  , doc = context.document, snapshot = context.dataSnapshot
	  , files;

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
				path: file.path,
				thumbPath: file.thumb._path,
				diskSize: file.diskSize,
				type: file.type,
				previewPath: touchObservable(resolve(file._preview, '_path'))
			};
		});
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
			section: snapshot.section && renderSection(snapshot.section, { disableLabel: true }),
			overviewSection: snapshot.overviewSection && renderSection(snapshot.overviewSection,
				{ disableLabel: true }),
			files: snapshot.files || [],
			archiveUrl: resolveSnapshotArchivePath(businessProcess, snapshot, kind)
		};
		data.filesSize = data.files.length;
	}
	return data;
};
