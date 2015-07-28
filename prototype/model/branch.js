'use strict';

var db                    = require('mano').db
  , StringLine            = require('dbjs-ext/string/string-line')(db)
  , FormSection           = require('../../model/form-section')(db)
  , PropertyGroupsProcess = require('../../model/lib/property-groups-process')(db)
  , Person                = require('../../model/person')(db);

module.exports = db.Object.extend('Branch', {
	companyName: {
		type: StringLine,
		required: true,
		label: "Name of the branch"
	},
	isFranchise: {
		type: db.Boolean,
		required: true,
		label: "Is Franchise?"
	},
	dataForms: { type: PropertyGroupsProcess, nested: true },
	responsiblePerson: { type: Person, nested: true },
	isActivitySameAsMotherCompany: {
		type: db.Boolean,
		value: true,
		required: true,
		label: "Is the activity the same as mother company's"
	},
	rangeOfActivity: {
		type: db.String,
		required: true,
		label: "Economic activity"
	}
});

db.Branch.prototype.dataForms.map.define('main', {
	type: FormSection,
	nested: true
});

db.Branch.prototype.dataForms.map.get('main').setProperties({
	propertyMasterType: db.Branch,
	propertyNames: ['companyName', 'responsiblePerson/firstName', 'responsiblePerson/lastName',
		'responsiblePerson/email', 'isActivitySameAsMotherCompany', 'rangeOfActivity']
});
