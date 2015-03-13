'use strict';

var firstKey = require('es5-ext/object/first-key')
  , db       = require('mano').db

  , isArray = Array.isArray;

module.exports = {
	validate: function (data) {
		var setId = firstKey(data)
		  , desc = db.objects.unserialize(setId)
		  , result = {};
		if (desc.master !== this.user) throw new Error('Unrecognized data');
		result.set = desc.object.get(desc.key);
		result.files = isArray(data[setId]) ? data[setId] : [data[setId]];
		result.files.forEach(function (file) { db.SubmissionFile._validateCreate_(file); });
		return result;
	},
	save: function (data) {
		data.files.forEach(function (file) {
			data.set.add(new db.SubmissionFile(file));
		});
	}
};
