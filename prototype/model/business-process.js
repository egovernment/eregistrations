// A mock model based on new business-process

'use strict';

var db = require('mano').db
  , BusinessProcessNew = require('../../model/business-process-new')(db)
  , first = BusinessProcessNew.newNamed('firstBusinessProcess')
  , second = BusinessProcessNew.newNamed('secondBusinessProcess')
  , UInteger = require('dbjs-ext/number/integer/u-integer')(db)
  , Person = require('../../model/person')(db)
  , FormSection = require('../../model/form-section')(db)
  , Registration = require('../../model/registration-new')(db)
  , Document = require('../../model/document')(db)
  , DeterminantSection
  , defineCertificates = require('../../model/business-process-new/utils/define-certificates')
  , defineRequirements = require('../../model/business-process-new/utils/define-requirements')
  , defineRequirementUploads =
			require('../../model/business-process-new/utils/define-requirement-uploads')
  , DocA
  , DocB
  , IdDoc
  , RequiredUploadA
  , processes = [first, second];

BusinessProcessNew.newNamed('emptyBusinessProcess');

module.exports = BusinessProcessNew;

BusinessProcessNew.prototype.defineProperties({
	isCompany: {
		type: db.Boolean,
		required: true,
		label: "Is company?"
	},
	needsSpecialCommittee: {
		type: db.Boolean,
		required: true,
		label: "Do you need validation by special committee?"
	},
	branchCount: {
		type: UInteger,
		required: true,
		label: "How many branches?"
	},
	representative: {
		type: Person,
		nested: true
	}
});

DocA = Document.extend('DocA', {
	label: { value: "Document A" },
	legend: { vlaue: "This document is issued as a result of Registration A" }
});

DocB = Document.extend('DocB', {
	label: { value: "Document B" },
	legend: { vlaue: "This document is issued as a result of Registration B" }
});

IdDoc = Document.extend('IdDoc', {
	label: { value: "Identification document" },
	legend: { vlaue: "This a requiredUpload for all registrations" }
});

RequiredUploadA = Document.extend('RequiredUploadA', {
	label: { value: "Required upload A" },
	legend: { vlaue: "This upload is required in case of registration A" }
});

defineCertificates(BusinessProcessNew, [DocA, DocB]);
defineRequirements(BusinessProcessNew, [IdDoc, RequiredUploadA]);
defineRequirementUploads(BusinessProcessNew, [IdDoc, RequiredUploadA]);

BusinessProcessNew.prototype.costs.map.define('handlingFee', {
	nested: true
});

BusinessProcessNew.prototype.costs.map.handlingFee.setProperties({
	amount: 70,
	label: "Handling fee"
});

BusinessProcessNew.prototype.registrations.map.define('a', { type: Registration, nested: true });
BusinessProcessNew.prototype.registrations.map.get('a').setProperties({
	label: "Registration A",
	shortLabel: "A",
	costs: function () {
		return [this.master.costs.map.handlingFee];
	},
	certificates: function () {
		return [this.master.certificates.map.docA];
	},
	requirements: function () {
		return [this.master.requirements.map.idDoc, this.master.requirements.map.requiredUploadA];
	}
});

BusinessProcessNew.prototype.registrations.map.define('b', { type: Registration, nested: true });
BusinessProcessNew.prototype.registrations.map.get('b').setProperties({
	label: "Registration B",
	shortLabel: "B",
	certificates: function () {
		return [this.master.certificates.map.docB];
	},
	requirements: function () {
		return [this.master.requirements.map.idDoc];
	}
});

DeterminantSection = FormSection.extend('DeterminantSection', {
	label: { value: "Determinants" },
	propertyNames: { value: [ 'isCompany', 'needsSpecialCommittee', 'branchCount', 'representative'] }
});

BusinessProcessNew.prototype.getDescriptor('determinants').type = DeterminantSection;

processes.forEach(function (businessProcess) {
	businessProcess.representative.firstName = "Johny";
	businessProcess.representative.lastName = "Doe";
	businessProcess.determinants.branchCount = 2;
	businessProcess.determinants.isCompany = false;
	businessProcess.determinants.needsSpecialCommittee = true;
	businessProcess.businessName = businessProcess.representative.fullName;
});
