'use strict';

var memoize = require('memoizee');

module.exports = memoize(function () {

	var schema = [];

	// get all business process extension
	db.BusinessProcess.extensions.forEach(function (service) {
		var serviceDefinition = service.toWSSchema();
		schema.push(serviceDefinition);
	});

	return schema;

}, { length: 0 });
