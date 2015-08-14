'use strict';

var endsWith          = require('es5-ext/string/#/ends-with')
  , ensureCallable    = require('es5-ext/object/valid-callable')
  , ensureObject      = require('es5-ext/object/valid-object')
  , ensureString      = require('es5-ext/object/validate-stringifiable-value')
  , debug             = require('debug-ext')('zip-archiver')
  , once              = require('timers-ext/once')
  , ensureDatabase    = require('dbjs/valid-dbjs')
  , generateHash      = require('murmurhash-js/murmurhash3_gc')
  , createWriteStream = require('fs').createWriteStream
  , path              = require('path')
  , archiver          = require('archiver')
  , getFilenames      = require('./lib/get-business-process-filenames')

  , basename = path.basename, resolve = path.resolve
  , re = /^\/business-process-archive-([0-9][0-9a-z]+)-([0-9]+)\.zip$/
  , create = Object.create, keys = Object.keys;

exports.filenameResetService = function (db) {
	var pending = create(null), immediateUpdate;
	ensureDatabase(db);
	var update = once(immediateUpdate = function () {
		++db._postponed_;
		keys(pending).forEach(function (id) {
			var bp = db.BusinessProcessBase.getById(id), url, filenames;
			delete pending[id];
			filenames = getFilenames(bp);
			if (!filenames.length) {
				if (bp.filesArchiveUrl) bp.delete('filesArchiveUrl');
				return;
			}
			url = '/business-process-archive-' + id + '-' +
				String(generateHash(filenames.map(function (file) { return file.path; })
					.sort().join('\n'))) + '.zip';
			if (bp.filesArchiveUrl === url) return;
			bp.filesArchiveUrl = url;
		});
		--db._postponed_;
	});
	db.BusinessProcessBase.instances.forEach(function (bp) {
		if (!bp.dataForms || !bp.dataForms.map || !bp.isSubmitted) return;
		pending[bp.__id__] = true;
	});
	immediateUpdate();
	db.objects.on('update', function (event) {
		var id = event.object.__valueId__, bp = event.object.master;
		if (!(bp instanceof db.BusinessProcessBase)) return;
		if (!bp.isSubmitted) return;
		if (!endsWith.call(id, '/path') && !endsWith.call(id, '/submissionForms/isAffidavitSigned')) {
			return;
		}
		pending[bp.__id__] = true;
		update();
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
		var url = req._parsedUrl.pathname, match = url.match(re), bp, archive, archiveFile, paths
		  , onError;
		if (!match) {
			next();
			return;
		}
		bp = db.BusinessProcessBase.getById(match[1]);
		if (!bp || !bp.isSubmitted || (bp.filesArchiveUrl !== url)) {
			res.statusCode = 404;
			res.end('Not Found');
			return;
		}
		debug("generate archive for %s %s", bp.__id__, bp.businessName);
		archive = archiver('zip', { level: 0 });
		archiveFile = createWriteStream(resolve(uploadsPath, url.slice(1)));
		archiveFile.on('error', onError = function (error) {
			if (!error) return;
			if (isDev) throw error;
			debug("cannot produce archive %s", error.stack);
			res.statusCode = 500;
			res.end('Server error');
		});
		archive.pipe(archiveFile);
		paths = getFilenames(bp).map(function (file) { return resolve(uploadsPath, file.path); });
		paths.forEach(function (path) { archive.file(path, { name: basename(path) }); });
		archive.finalize(onError);
		archive.on('error', onError);
		archiveFile.on('error', onError);
		archiveFile.on('close', function () {
			debug("finalised generation of archive for %s %s", bp.__id__, bp.businessName);
			stMiddleware(req, res, next);
		});
	};
};
