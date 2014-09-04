'use strict';

var db       = require('mano').db
  , File     = require('dbjs-ext/object/file')(db)
  , JpegFile = require('dbjs-ext/object/file/image-file/jpeg-file')(db);

module.exports = File.extend('SubmissionFile', {
	preview: { type: File, required: true },
	thumb: { type: JpegFile, required: true }
}, {
	accept: { value: ['image/jpeg', 'application/pdf', 'image/png'] }
});
