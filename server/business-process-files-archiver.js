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
  , unlink            = require('fs2/unlink')
  , path              = require('path')
  , archiver          = require('archiver')
  , getFilenames      = require('./lib/get-business-process-filenames')
  , setupTrigger      = require('./setup-triggers')

  , basename = path.basename, resolve = path.resolve
  , re = /^\/business-process-archive-([0-9][0-9a-z]+)-([0-9]+)\.zip$/
  , create = Object.create, keys = Object.keys;

exports.filenameResetService = function (db, data) {
	var uploadsPath, pending = create(null);
	ensureDatabase(db);
	ensureObject(data);
	uploadsPath = ensureString(data.uploadsPath);
	var update = once(function () {
		++db._postponed_;
		keys(pending).forEach(function (id) {
			var bp = db.BusinessProcessBase.getById(id), url, filenames, oldFilename;
			delete pending[id];
			if (!bp) return;
			if (!bp.isSubmitted) {
				if (bp.filesArchiveUrl) bp.delete('filesArchiveUrl');
				return;
			}
			filenames = getFilenames(bp);
			if (!filenames.length) {
				if (bp.filesArchiveUrl) bp.delete('filesArchiveUrl');
				return;
			}
			url = '/business-process-archive-' + id + '-' +
				String(generateHash(filenames.map(function (file) { return file.path; })
					.sort().join('\n'))) + '.zip';
			if (bp.filesArchiveUrl === url) return;
			if (bp.filesArchiveUrl) {
				oldFilename = resolve(uploadsPath, bp.filesArchiveUrl.slice(1));
				unlink(oldFilename).done(null, function (err) {
					if (err.code === 'ENOENT') return;
					debug("Could not remove old file %s %s", oldFilename, err.stack);
				});
			}
			bp.filesArchiveUrl = url;
		});
		--db._postponed_;
	});
	setupTrigger({
		trigger: db.BusinessProcess.instances.filterByKey('isFromEregistrations', true)
	}, function (bp) {
		pending[bp.__id__] = true;
		update();
	});
	db.objects.on('update', function (event) {
		if (event.sourceId === 'persistentLayer') return;
		var id = event.object.__valueId__, bp = event.object.master;
		if (!(bp instanceof db.BusinessProcessBase)) return;
		if (!bp.dataForms || !bp.dataForms.map) return;
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
		  , onError, fileNameUseCount = {};
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
		paths.forEach(function (path) {
			// Change filename from form 'file-skey-buniness-name-document-label.xxx' to
			// 'buniness-name-document-label-index.xxx' for ux reasons.
			var name = basename(path).replace(/^[\d\w]+-/, '').split('.');

			if (!fileNameUseCount[name]) fileNameUseCount[name] = 0;

			name[0] += '-' + String(++fileNameUseCount[name]);

			archive.file(path, {
				name: name.join('.')
			});
		});
		archive.finalize(onError);
		archive.on('error', onError);
		archiveFile.on('error', onError);
		archiveFile.on('close', function () {
			debug("finalised generation of archive for %s %s", bp.__id__, bp.businessName);
			stMiddleware(req, res, next);
		});
	};
};
