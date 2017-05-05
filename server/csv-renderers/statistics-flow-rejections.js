'use strict';

var ensureObject = require('es5-ext/object/valid-object')
  , _           = require('mano').i18n;

module.exports = function (result, config) {
	ensureObject(config);
	var data;

	data = [
		[_("Rejection reasons"), "", "",
			_("Operator"), _("Role"), _("Date"), _("File")
			].join(',')
	];

	data.push.apply(data, result.map(function (row) {
		row.forEach(function (column, index) {
			if (column.constructor === Array) column = column.join(' ');
			row[index] = '\"' + column.replace(/\r?\n|\r/g, ' ').replace(/"/g, "'") + '\"';
		});
		return row;
	}));

	return data.join('\n');
};
