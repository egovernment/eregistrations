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
	  , inputMap, theirData, expectedResult, statusLog

	  , bp;

	BusinessProcess.prototype.dataForms.map.define('main', {
		type: FormSection,
		nested: true
	});

	BusinessProcess.prototype.dataForms.map.main.setProperties({
		propertyNames: ['businessName', 'representative/firstName',
			'representative/lastName', 'representative/address/street']
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

	// simple case
	inputMap = {};
	inputMap['request/data/businessName'] = 'nombreDeBusinesso';
	theirData = { nombreDeBusinesso: 'Tests' };
	bp.businessName = 'Tests';
	expectedResult = { request: { data: { businessName: 'Tests' } } };
	a.deep(t(bp, inputMap, theirData), expectedResult);
	// When trying to send input that does not match mapping - ignore non mapped
	theirData.notMappedPath = 'bad data';
	a.deep(t(bp, inputMap, theirData), expectedResult);
	// Complex mapping, including nesteds
	inputMap['request/data/representative/firstName'] = 'nombre';
	inputMap['request/data/representative/lastName'] = 'representante/secondoNombre';
	theirData.nombre = 'Marry';
	theirData.representante = { secondoNombre: 'Poppins' };
	bp.representative.firstName = 'Marry';
	bp.representative.lastName = 'Poppins';
	expectedResult.request.data.representative = { firstName: 'Marry' };
	expectedResult.request.data.representative.lastName = 'Poppins';
	a.deep(t(bp, inputMap, theirData), expectedResult);
	// Nested within nested
	inputMap['request/data/representative/address/street'] = 'calle';
	theirData.calle = 'Cherry Lane';
	bp.representative.address.street = 'Cherry Lane';
	expectedResult.request.data.representative.address = { street: 'Cherry Lane' };
	a.deep(t(bp, inputMap, theirData), expectedResult);
	// Nested map
	inputMap['request/data/statusLog/*/text'] = 'mensajos/*/mensajeTxt';
	inputMap['request/data/statusLog/*/label'] = 'mensajos/*/mensajeLabel';
	theirData.mensajos = [
		{ id: bp.statusLog.ordered.first.key, mensajeTxt: 'Datos recibidos', mensajeLabel: 'Primer' },
		{ id: bp.statusLog.ordered.last.key, mensajeTxt: 'Datos processados', mensajeLabel: 'Secondo' },
		{ id: 'nonMatchingId', mensajeTxt: 'Not valid', mensajeLabel: 'Third' }
	];

	expectedResult.request.data.statusLog = [
		{ id: bp.statusLog.ordered.first.key, text: 'Datos recibidos', label: 'Primer' },
		{ id: bp.statusLog.ordered.last.key, text: 'Datos processados', label: 'Secondo' }
	];

	a.deep(t(bp, inputMap, theirData), expectedResult);
};
