'use strict';

var db  = require('../../db')
  , Set = require('es6-set');

module.exports = function () {
	var names = new Set([]);

	db.BusinessProcess.extensions.forEach(function (BusinessProcessClass) {
		var frontDesk = BusinessProcessClass.prototype.processingSteps.frontDesk;
		if (frontDesk) {
			names.add(frontDesk.key);
		}
	});

	return names;
};
