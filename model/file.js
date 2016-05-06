'use strict';

var memoize        = require('memoizee/plain')
  , validDb        = require('dbjs/valid-dbjs')
  , defineFile     = require('dbjs-ext/object/file')
  , defineJpegFile = require('dbjs-ext/object/file/image-file/jpeg-file')
  , docMimeTypes   = require('../utils/microsoft-word-doc-mime-types');

module.exports = memoize(function (db) {
	var File, JpegFile;
	validDb(db);
	File               = defineFile(db);
	File.prototype.url = function () {
		return this.path ? '/' + this.path.split('/').map(encodeURIComponent).join('/') : null;
	};
	JpegFile = defineJpegFile(db);
	File.prototype.defineProperties({
		preview: { type: File, value: function () {
			return this.isPreviewGenerated ? this.generatedPreview : this;
		} },
		isPreviewGenerated: { type: db.Boolean, value: true },
		generatedPreview: { type: File, nested: true },
		thumb: { type: JpegFile, nested: true },
		toJSON: { value: function (descriptor) {
			return { kind: 'fileValue', path: this.path, thumbPath: this.thumb.path,
				diskSize: this.diskSize, type: this.type, previewPath: this.preview.path };
		} },
		isEmpty: { value: function (ignore) { return !this.path; } }
	});
	File.accept = ['image/jpeg', 'application/pdf', 'image/png'].concat(docMimeTypes);

	return File;
}, { normalizer: require('memoizee/normalizers/get-1')() });
