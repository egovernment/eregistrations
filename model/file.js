'use strict';

var memoize        = require('memoizee/plain')
  , validDb        = require('dbjs/valid-dbjs')
  , defineFile     = require('dbjs-ext/object/file')
  , defineJpegFile = require('dbjs-ext/object/file/image-file/jpeg-file');

module.exports = memoize(function (db) {
	var File, JpegFile;
	validDb(db);
	File               = defineFile(db);
	File.prototype.url = function () {
		return this.path ? '/' + encodeURIComponent(this.path) : null;
	};
	JpegFile = defineJpegFile(db);
	File.prototype.defineProperties({
		preview: { type: File, value: function () {
			return this.isPreviewGenerated ? this.generatedPreview : this;
		} },
		isPreviewGenerated: { type: db.Boolean, value: true },
		generatedPreview: { type: File, nested: true },
		thumb: { type: JpegFile, nested: true }
	});
	File.accept = ['image/jpeg', 'application/pdf', 'image/png', 'image/pjpeg', 'image/x-png'];

	return File;
}, { normalizer: require('memoizee/normalizers/get-1')() });
