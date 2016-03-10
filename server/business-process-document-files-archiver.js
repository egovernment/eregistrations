'use strict';

var forEach            = require('es5-ext/object/for-each')
  , ensureCallable     = require('es5-ext/object/valid-callable')
  , ensureObject       = require('es5-ext/object/valid-object')
  , ensureString       = require('es5-ext/object/validate-stringifiable-value')
  , hyphenToCamel      = require('es5-ext/string/#/hyphen-to-camel')
  , endsWith           = require('es5-ext/string/#/ends-with')
  , debug              = require('debug-ext')('zip-archiver')
  , ensureDatabase     = require('dbjs/valid-dbjs')
  , createWriteStream  = require('fs').createWriteStream
  , unlink             = require('fs2/unlink')
  , path               = require('path')
  , archiver           = require('archiver')
  , resolveArchivePath = require('../utils/resolve-document-archive-path')

  , resolve = path.resolve;

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

exports.archiveServer = function (queryHandler, data) {
	var uploadsPath, isDev, stMiddleware;
	ensureCallable(queryHandler);
	ensureObject(data);
	uploadsPath = ensureString(data.uploadsPath);
	isDev = ensureObject(data.env).dev;
	stMiddleware = ensureCallable(data.stMiddleware);
	return function (req, res, next) {
		var url = req._parsedUrl.pathname, match = url.match(re), archive, archiveFile, onError
		  , businessProcessId, documentType, key;
		if (!match) {
			next();
			return;
		}
		businessProcessId = match[1];
		documentType = match[2];
		key = match[3];
		queryHandler([businessProcessId], 'documentFilePaths', {
			businessProcessId: businessProcessId,
			documentType: match[2],
			key: hyphenToCamel.call(match[3])
		}).done(function (filesMap) {
			if (!filesMap) {
				res.statusCode = 404;
				res.end('Not Found');
				return;
			}
			debug("generate archive for %s %s %s", businessProcessId, documentType, key);
			archive = archiver('zip', { level: 0 });
			archiveFile = createWriteStream(resolve(uploadsPath, url.slice(1)));
			archiveFile.on('error', onError = function (error) {
				if (!error) return;
				if (isDev) throw error;
				debug("cannot produce archive for %s %s %s %s", businessProcessId, documentType, key,
					error.stack);
				res.statusCode = 500;
				res.end('Server error');
			});
			archive.pipe(archiveFile);
			forEach(filesMap, function (path, name) {
				archive.file(resolve(uploadsPath, path), { name: name });
			});
			archive.finalize(onError);
			archive.on('error', onError);
			archiveFile.on('error', onError);
			archiveFile.on('close', function () {
				debug("finalised generation of archive for %s %s %s", businessProcessId, documentType, key);
				stMiddleware(req, res, next);
			});
		}, function (err) {
			console.error(err.stack);
			res.statusCode = 500;
			res.end('Server error');
		});
	};
};
