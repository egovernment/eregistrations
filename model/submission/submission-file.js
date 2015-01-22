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
			return this !== this.externalPreview ? this.externalPreview : this;
		} },
		externalPreview: { type: File, required: true, nested: true },
		thumb: { type: JpegFile, required: true, nested: true }
	}, {
		accept: { value: ['image/jpeg', 'application/pdf', 'image/png'] }
	});

	return db.SubmissionFile;
}, { normalizer: require('memoizee/normalizers/get-1')() });
