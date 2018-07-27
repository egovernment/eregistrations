'use strict';

var Database   = require('dbjs')
  , defineFormSection = require('../../model/form-section')
  , defineFormEntitiesTableSection = require('../../model/form-entities-table')
  , defineBp = require('../../model/business-process-new/index');

module.exports = function (t, a) {
	var db = new Database()
  , BusinessProcess = defineBp(db)
  , FormSection = defineFormSection(db)
  , FormEntitiesTable = defineFormEntitiesTableSection(db)
  , statusLog, bp;

	BusinessProcess.prototype.getOwnDescriptor('businessName').max = 15;
	BusinessProcess.prototype.dataForms.map.define('main', {
		type: FormSection,
		nested: true
	});

	BusinessProcess.prototype.dataForms.map.main.setProperties({
		propertyNames: ['businessName', 'representative/firstName',
			'representative/lastName', 'representative/address/street', 'representative/email']
	});

	db.StatusLog.prototype.define('dataForms', {
		type: db.PropertyGroupsProcess,
		nested: true
	});

	db.StatusLog.prototype.dataForms.map.define('main', {
		type: FormSection,
		nested: true
	});

	db.StatusLog.prototype.dataForms.map.main.setProperties({
		propertyMasterType: db.StatusLog,
		propertyNames: ['text', 'label']
	});

	BusinessProcess.prototype.dataForms.map.define('statusLogs', {
		type: FormEntitiesTable,
		nested: true
	});

	BusinessProcess.prototype.dataForms.map.statusLogs.setProperties({
		propertyName: 'statusLog',
		sectionProperty: 'dataForms'
	});

	db.Object.extend('Address', {
		street: { type: db.String }
	});

	BusinessProcess.prototype.representative.defineProperties({
		address: {
			type: db.Address,
			nested: true
		}
	});
	bp = new BusinessProcess();

	statusLog = bp.statusLog.map.newUniq();
	statusLog.setProperties({
		time: new Date(2017, 0),
		text: 'First status log',
		label: 'Log 1'
	});
	statusLog = bp.statusLog.map.newUniq();
	statusLog.setProperties({
		time: new Date(2017, 1),
		text: 'Second status log',
		label: 'Log 2'
	});
	bp.businessName = 'Sample name';
	bp.representative.firstName = "Kamil";
	bp.representative.lastName = "Gruca";
	bp.representative.address.street = "Cherry Lane";
	bp.representative.email = "good@email.com";

	// simple case
	var wsJSON = bp.toWebServiceJSON({ includeFullMeta: true });
	a.deep(t(bp, wsJSON), []);
	wsJSON.request.data.businessName.value = 'The name which is too long';
	var result = t(bp, wsJSON);
	a(result[0].message, "String too long");
	a(result[0].code, "STRING_TOO_LONG");
	wsJSON.request.data.representative.email.value = 'bademail.com';
	result = t(bp, wsJSON);
	a(result[0].message, "String too long");
	a(result[0].code, "STRING_TOO_LONG");
	a(result[1].message, "bademail.com doesn't match pattern");
	a(result[1].code, "INVALID_STRING");
};
