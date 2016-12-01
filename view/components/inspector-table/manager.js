// Inspector dedicated list manager

'use strict';

var toNaturalNumber = require('es5-ext/number/to-pos-integer')
  , d               = require('d')
  , db              = require('mano').db
  , getData         = require('mano/lib/client/xhr-driver').get
  , ListManager     = require('../objects-table-simple/manager')

  , defineProperties = Object.defineProperties, BusinessProcess = db.BusinessProcess;

var BusinessProcessesManager = module.exports = function (conf) {
	var itemsPerPage  = toNaturalNumber(conf.itemsPerPage);

	if (itemsPerPage) this.itemsPerPage = itemsPerPage;

	defineProperties(this, {
		_queryExternal: d(function (query) {
			return getData('/get-data/', query).aside(function (result) {
				if (!result.data) return;
				result.data.forEach(function (eventStr) {
					db.unserializeEvent(eventStr, 'server-temporary');
				});
			});
		})
	});
};

BusinessProcessesManager.prototype = Object.create(ListManager.prototype, {
	constructor: d(BusinessProcessesManager),
	_type: d(BusinessProcess)
});
