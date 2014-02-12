'use strict';

var archiver = require('archiver')
  , replace = require('es5-ext/string/#/plain-replace-all')
  , deferred = require('deferred')
  , promisify = require('deferred').promisify
  , unidecode = require('unidecode')
  , fs = require('fs')
  , lstat = promisify(fs.lstat)
  , renameFile = promisify(fs.rename)
  , path = require('path')
  , resolve = path.resolve
  , envUploadsDir = require('mano').uploadsPath;

module.exports = function (user/*, options*/) {
	var def = deferred()
	  , options =  Object(arguments[1])
	  , uploadsPath
	  , files = []
	  , missingFiles = []
	  , archDocumentName
	  , zipTempName = user.applicationNumber + '.'
			+ replace.call(user.fullName, ' ', '-') + Date.now() + '.zip'
	  , zipName = user.applicationNumber + '.'
			+ replace.call(user.fullName, ' ', '-') + '.zip';

	if (options.uploadsPath != null) uploadsPath = options.uploadsPath;
	else uploadsPath = envUploadsDir;

	user.uploadedSubmissions.forEach(function (doc) {
		var docName = doc.constructor.Document.label, zipFileName, index = 0;
		docName = replace.call(docName, ' ', '-');
		zipFileName = user.applicationNumber + "." + docName;
		doc.files.forEach(function (file) {
			var fileExtension = path.extname(file.path)
			  , archFile = zipFileName;
			if (index) archFile += '.' + index;
			archFile += fileExtension;
			archFile = unidecode(archFile);
			files.push({ path: file.path, name: archFile });
			++index;
		});
	});
	//add further files
	if (options.extraFiles) {
		options.extraFiles.forEach(function (file) {
			if (file.path) {
				archDocumentName =  user.applicationNumber + "."
					+ file.name
					+ path.extname(file.path);
				files.push({ path: file.path,
					name: archDocumentName });
			}
		});
	}
	deferred.map(files, function (file) {
		return lstat(file.path)(function (stats) {
			file.exists = true;
		}, function (err) {
			if (err.code !== 'ENOENT') throw err;
			missingFiles.push(file.path);
			file.exists = false;
		})(file);
	}).invoke('filter', function (file) {
		return file.exists;
	}).done(function (files) {
		var outputFile, zipper;

		if (!files.length) {
			def.resolve({ zipName: null, missingFiles: missingFiles });
			return;
		}
		//init zipper
		zipper = archiver('zip', { level: 0 });
		outputFile = fs.createWriteStream(resolve(uploadsPath, zipTempName));
		outputFile.on('close', function () {
			renameFile(resolve(uploadsPath, zipTempName),
				resolve(uploadsPath, zipName))
				.done(function () {
					def.resolve({ zipName: zipName, missingFiles: missingFiles });
				}, def.reject);
		});
		outputFile.on('error', def.reject);
		zipper.pipe(outputFile);
		files.forEach(function (file) {
			zipper.file(file.path, { name: file.name });
		});
		zipper.finalize(function (err) {
			if (err) def.reject(err);
		});
		zipper.on('error', def.reject);
	}, def.reject);
	return def.promise;
};
