'use strict';

var customError = require('es5-ext/error/custom')
  , contains    = require('es5-ext/string/#/contains')
  , d           = require('d')
  , deferred    = require('deferred')
  , mano        = require('mano')
  , unlink      = require('fs2/unlink')
  , gm          = require('./gm')
  , path        = require('path')
  , replace     = require('es5-ext/string/#/plain-replace-all')

  , resolve = path.resolve
  , db = mano.db, _ = mano.i18n.bind('Controller'), uploadsPath = mano.uploadsPath;

Object.defineProperty(db.File.prototype, 'onUpload', d(function () {
	var path = uploadsPath, thumb, preview, processFullPath, thumbFullPath, previewFullPath, errMsg
	  , previewPath = this.path
	  , processPath = this.path
	  , thumbPath = replace.call(this.__id__, '/', '-')
			+ '.thumb.' + this.name;

	if (!db.File.accept.has(this.type)) {
		errMsg = _("Error: Uploaded file \"${ filename }\" is of not supported type \"${ type }\"",
			{ filename: this.name, type: this.type });
		this._destroy_();
		return deferred.reject(customError(errMsg, 'UNSUPPORTED_FILE_TYPE'));
	}

	// Generate thumb and (if needed) preview
	if (this.type !== 'image/jpeg') {
		thumbPath += '.jpg';
		previewPath += '.jpg';
	}
	if (this.type === 'application/pdf') processPath += '[0]';
	processFullPath = resolve(path, processPath);
	thumbFullPath = resolve(path, thumbPath);
	thumb = gm(processFullPath).resize(500, 500).writeP(thumbFullPath);

	if (this.path !== previewPath) {
		previewFullPath = resolve(path, previewPath);
		preview = gm(processFullPath).resize(1500, 1500).writeP(previewFullPath);
	}
	return deferred(thumb, preview)(function () {
		if (!this.path) return deferred(unlink(thumbFullPath), preview && unlink(previewFullPath));
		this.thumb.path = thumbPath;
		if (preview) {
			this.generatedPreview.path = previewPath;
		} else {
			this.isPreviewGenerated = false;
		}
	}.bind(this), function (e) {
		if (!this.path && contains.call(e.message, 'Unable to open file')) {
			return deferred(unlink(thumbFullPath), preview && unlink(previewFullPath))(null, false);
		}
		throw e;
	}.bind(this));
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
