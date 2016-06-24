'use strict';

var contains     = require('es5-ext/string/#/contains')
  , startsWith   = require('es5-ext/string/#/starts-with')
  , deferred     = require('deferred')
  , path         = require('path')
  , unlink       = require('fs2/unlink')
  , mano         = require('mano')
  , gm           = require('./gm')
  , docMimeTypes = require('../utils/microsoft-word-doc-mime-types')

  , resolve = path.resolve, extname = path.extname
  , uploadsPath = mano.uploadsPath;

module.exports = function (file) {
	var path        = uploadsPath
	  , previewPath = file.path
	  , processPath = file.path
	  , extension   = extname(file.path)
	  , thumbPath   = file.path.slice(0, -extension.length) + '.thumb' + extension
	  , thumb, preview, processFullPath, thumbFullPath, previewFullPath;

	//Skip for word doc
	if (docMimeTypes.indexOf(file.type) !== -1) return deferred(null);

	if (file.type !== 'image/jpeg') {
		thumbPath += '.jpg';
		previewPath += '.jpg';
	}
	if (file.type === 'application/pdf') {
		processPath += '[0]';
	}

	processFullPath = resolve(path, processPath);
	thumbFullPath = resolve(path, thumbPath);
	thumb = gm(processFullPath).density(300, 300).resize(500, 500, '>').writeP(thumbFullPath);

	if (file.path !== previewPath) {
		previewFullPath = resolve(path, previewPath);
		preview = gm(processFullPath).density(300, 300).resize(1500, 1500, '>').writeP(previewFullPath);
	}

	return deferred(thumb, preview)(function () {
		if (!file.path) {
			return deferred(unlink(thumbFullPath), preview && unlink(previewFullPath));
		}

		file.thumb.path = thumbPath;
		if (preview) {
			file.generatedPreview.path = previewPath;
		} else {
			file.isPreviewGenerated = false;
		}
	}, function (e) {
		if (!file.path && contains.call(e.message, 'Unable to open file')) {
			return deferred(unlink(thumbFullPath), preview && unlink(previewFullPath))(null, false);
		}
		console.log(e);
		if (contains.call(e.message, "Improper image header")) {
			console.log("Cannot generate previews", e.stack);
			return;
		}
		if (startsWith.call(e.message, "Command failed: gm convert:")) {
			console.error("\nCould not generate thumb and preview:\n");
			console.error(e.stack + "\n\n");
			return;
		}
		if (contains.call(e.message, "GPL Ghostscript")) {
			console.error("\nCould not generate thumb and preview:\n");
			console.error(e.stack + "\n\n");
			return;
		}
		throw e;
	});
};
