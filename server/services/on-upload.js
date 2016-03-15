'use strict';

var customError = require('es5-ext/error/custom')
  , d           = require('d')
  , deferred    = require('deferred')
  , mano        = require('mano')
  , unlink      = require('fs2/unlink')
  , path        = require('path')
  , generateThumbAndPreview = require('../generate-thumb-and-preview')

  , resolve = path.resolve
  , db = mano.db, _ = mano.i18n.bind('Controller'), uploadsPath = mano.uploadsPath;

Object.defineProperty(db.File.prototype, 'onUpload', d(function () {
	var errMsg;

	if (!db.File.accept.has(this.type)) {
		errMsg = _("Error: Uploaded file \"${ filename }\" is of not supported type \"${ type }\"",
			{ filename: this.name, type: this.type });
		this._destroy_();
		return deferred.reject(customError(errMsg, 'UNSUPPORTED_FILE_TYPE'));
	}

	return generateThumbAndPreview(this);
}));

db.objects.on('update', function (nu, old) {
	if (!old || !old.value) return;
	if (nu && (nu.value === old.value)) return;
	if (old.object._kind_ === 'descriptor') {
		if ((old.object.object instanceof db.File) && (old.object.key === 'path')) {
			// Delete unlinked file
			console.log("Remove file", old.value);
			unlink(resolve(uploadsPath, old.value)).done(null, function (err) { console.error(err); });
		}
	}
});
