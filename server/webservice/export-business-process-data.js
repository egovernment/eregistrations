'use strict';

var uncapitalize = require('es5-ext/string/#/uncapitalize')
  , ensureBusinessProcessType = require('../../utils/ensure-business-process-type');

module.exports = function (businessProcess) {
	var businessProcessDTO = {};
	// some checks
	if (!businessProcess) return;
	if (!businessProcess.isSubmitted) return;

	// base data
	businessProcessDTO.id = businessProcess.__id__;
	businessProcessDTO.service = {};
	businessProcessDTO.service.code =
		uncapitalize.call(businessProcess.constructor.__id__.replace('BusinessProcess', ''));

	businessProcessDTO.submittedTimestamp = businessProcess._isSubmitted.lastModified;
	
	// part a - registrations
	businessProcessDTO.registrations = [];
	businessProcess.registrations.applicable.forEach(function (reg) {
		var registration = {};
		registration.code = reg.abbr;
		businessProcessDTO.registrations.push(registration);
	}, this);

	// part a - documents uploaded
	businessProcessDTO.uploadedDocuments = [];
	businessProcess.requirementUploads.applicable.forEach(function (req) {
		var requirement = {};
		requirement.code = req.abbr;
		requirement.files = [];
		req.document.files.map.forEach(function (f) {
			requirement.files.push({ url: f.url });
		});
		// status properties
		requirement.revised = req.status ? true : false;
		requirement.revisedTimestamp = req.status ? req._status.lastModified : null;
		
		// #TODO data forms for requirements - not really existent 

		businessProcessDTO.uploadedDocuments.push(requirement);
	}, this);

	// part a - costs
	businessProcessDTO.costs = [];
	businessProcess.costs.applicable.forEach(function (ct, key) {
		var cost = {};
		cost.code = ct.constructor.__id__;
		cost.currency = ct._amount.descriptor.type.isoCode;
		cost.amount = ct.amount;

		if (ct.amount) {
			businessProcessDTO.costs.push(cost);
		}
	}, this);
	return businessProcessDTO;
};
