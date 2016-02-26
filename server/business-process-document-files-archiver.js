'use strict';

var hyphenToCamel      = require('es5-ext/string/#/hyphen-to-camel')
  , endsWith           = require('es5-ext/string/#/ends-with')
  , ensureCallable     = require('es5-ext/object/valid-callable')
  , ensureObject       = require('es5-ext/object/valid-object')
  , ensureString       = require('es5-ext/object/validate-stringifiable-value')
  , debug              = require('debug-ext')('zip-archiver')
  , ensureDatabase     = require('dbjs/valid-dbjs')
  , createWriteStream  = require('fs').createWriteStream
  , unlink             = require('fs2/unlink')
  , path               = require('path')
  , archiver           = require('archiver')
  , resolveArchivePath = require('../utils/resolve-document-archive-path')

  , resolve = path.resolve, basename = path.basename;

var re = new RegExp('^\\/business-process-document-archive-([0-9][0-9a-z]+)-' +
	'(requirement|receipt|certificate)-([a-z][a-z0-9-]*)\\.zip$');

var unlinkDocumentFiles = function (uploadsPath, document) {
	var filename = resolve(uploadsPath, resolveArchivePath(document));
	unlink(filename).done(null, function (err) {
		if (err.code === 'ENOENT') return;
		debug("Could not remove file %s %s", filename, err.stack);
	});
};

var isArchivable = function (document) {
	var owner = document.owner && document.owner.owner;
	if (!owner) return false;
	if (owner.key === 'certificates') return true;
	owner = owner.owner;
	if (!owner) return false;
	if (owner.key === 'requirementUploads') return true;
	if (owner.key === 'paymentReceiptUploads') return true;
};

exports.filenameResetService = function (db, data) {
	var uploadsPath;
	ensureDatabase(db);
	ensureObject(data);
	uploadsPath = ensureString(data.uploadsPath);
	db.objects.on('update', function (event) {
		if (event.sourceId === 'persistentLayer') return;
		var id = event.object.__valueId__, bp = event.object.master, document, file;
		if (!(bp instanceof db.BusinessProcess)) return;
		if (!bp.isSubmitted) return;
		if (!endsWith.call(id, '/path')) return;
		if (endsWith.call(id, '/thumb/path')) return;
		if (endsWith.call(id, '/preview/path')) return;
		file = event.object.object;
		document = file.owner && file.owner.owner && file.owner.owner.owner;
		if (!(document instanceof db.Document) || !isArchivable(document)) return;
		unlinkDocumentFiles(uploadsPath, document);
	});
};

exports.archiveServer = function (db, data) {
	var uploadsPath, isDev, stMiddleware;
	ensureDatabase(db);
	ensureObject(data);
	uploadsPath = ensureString(data.uploadsPath);
	isDev = ensureObject(data.env).dev;
	stMiddleware = ensureCallable(data.stMiddleware);
	return function (req, res, next) {
		var url = req._parsedUrl.pathname, match = url.match(re), bp, archive, archiveFile
		  , onError, key, target, fileIdx = 0;
		if (!match) {
			next();
			return;
		}
		bp = db.BusinessProcessBase.getById(match[1]);
		if (!bp || !bp.isSubmitted) {
			res.statusCode = 404;
			res.end('Not Found');
			return;
		}
		key = hyphenToCamel.call(match[3]);
		if (match[2] === 'requirement') {
			bp.requirementUploads.applicable.some(function (upload) {
				if (upload.document.uniqueKey === key) {
					target = upload.document;
					return true;
				}
			});
		} else if (match[2] === 'receipt') {
			target = bp.paymentReceiptUploads.map.get(key);
			if (target && !bp.paymentReceiptUploads.applicable.has(target)) target = null;
			if (target) target = target.document;
		} else {
			target = bp.certificates.map.get(key);
			if (target && !bp.certificates.applicable.has(target)) target = null;
		}
		if (!target || (target.files.ordered <= 1)) {
			res.statusCode = 404;
			res.end('Not Found');
			return;
		}
		debug("generate archive for %s", target.__id__);
		archive = archiver('zip', { level: 0 });
		archiveFile = createWriteStream(resolve(uploadsPath, url.slice(1)));
		archiveFile.on('error', onError = function (error) {
			if (!error) return;
			if (isDev) throw error;
			debug("cannot produce archive for %s %s", target.__id__, error.stack);
			res.statusCode = 500;
			res.end('Server error');
		});
		archive.pipe(archiveFile);
		target.files.ordered.forEach(function (file) {
			// Change filename from form 'file-skey-buniness-name-document-label.xxx' to
			// 'buniness-name-document-label-index.xxx' for ux reasons.
			var name = basename(file.path).replace(/^[\d\w]+-/, '').split('.');
			name[0] += '-' + String(++fileIdx);

			archive.file(resolve(uploadsPath, file.path), {
				name: name.join('.')
			});
		});
		archive.finalize(onError);
		archive.on('error', onError);
		archiveFile.on('error', onError);
		archiveFile.on('close', function () {
			debug("finalised generation of archive for %s", target.__id__);
			stMiddleware(req, res, next);
		});
	};
};
