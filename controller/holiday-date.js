'use strict';

var db          = require('mano').db
  , _           = require('mano').i18n.bind('Controller')
  , customError = require('es5-ext/error/custom');

var validateDate = function (data) {
	var date = db.Date.fromInputValue(data.date);
	if (!date) throw customError(_("Choose date"), 'DATE_MISSING', { fieldName: 'date' });
	return date;
};

module.exports = function () {
	return {
		'add-holiday-date': {
			validate: validateDate,
			submit: function (date) { db.globalPrimitives.holidays.add(date); }
		},
		'delete-holiday-date': {
			validate: validateDate,
			submit: function (date) { db.globalPrimitives.holidays.delete(date); }
		}
	};
};
