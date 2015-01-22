'use strict';

var memoize        = require('memoizee/plain')
  , validDb        = require('dbjs/valid-dbjs')
  , defineFile     = require('dbjs-ext/object/file')
  , defineJpegFile = require('dbjs-ext/object/file/image-file/jpeg-file');

module.exports = memoize(function (db) {
	var File, JpegFile;
	validDb(db);
	File     = defineFile(db);
	JpegFile = defineJpegFile(db);
	File.extend('SubmissionFile', {
		preview: { type: File, value: function () {
			return this.isPreviewGenerated ? this.generatedPreview : this;
		} },
		isPreviewGenerated: { type: db.Boolean, value: true },
		generatedPreview: { type: File, nested: true },
		thumb: { type: JpegFile, nested: true }
	}, {
		accept: { value: ['image/jpeg', 'application/pdf', 'image/png'] }
	});

	return db.SubmissionFile;
}, { normalizer: require('memoizee/normalizers/get-1')() });
