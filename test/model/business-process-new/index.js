'use strict';

var Database   = require('dbjs')
  , defineBase = require('../../../model/base');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = t(db)

	  , businessProcess = new BusinessProcess();

	defineBase(db);

	a(businessProcess.isFromEregistrations, true);
	a.deep(businessProcess.toWebServiceJSON().request.data, {});
};
