'use strict';

var db   = require('mano').db,
	user = db.User.prototype;

module.exports = exports = require('../../view/business-process-revision-form');

exports._officialForm = function (context) {
	return context.businessProcess.certificates.map.docA.dataForm.toDOMForm(document);
};
