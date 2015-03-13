'use strict';

var db = require('mano').db;

module.exports = {
	validate: function (data) {
		var file = db.SubmissionFile.getById(data.fileId);
		if (!file) throw new Error('File not found');
		return file;
	},
	save: function (file) { db.objects.delete(file); }
};
