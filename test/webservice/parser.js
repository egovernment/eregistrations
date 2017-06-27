'use strict';

var Database   = require('dbjs')
  , defineBp = require('../../model/business-process-new/index');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = defineBp(db)
	  , inputMap, theirData, expectedResult, statusLog

	  , bp = new BusinessProcess();

	db.Object.extend('Address', {
		street: { type: db.String }
	});

	bp.representative.defineProperties({
		address: {
			type: db.Address,
			nested: true
		}
	});

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

	/*************** RECEIVING *****************/
	// simple case
	inputMap = { businessName: 'nombreDeBusinesso' };
	theirData = { nombreDeBusinesso: 'Tests' };
	expectedResult = bp.toWebServiceJSON();
	expectedResult.request.data = { businessName: 'Tests' };
	a.deep(t(bp, inputMap, { theirData: theirData }), expectedResult);
	// When trying to send input that does not match mapping - ignore non mapped
	theirData.notMappedPath = 'bad data';
	a.deep(t(bp, inputMap, { theirData: theirData }), expectedResult);
	// Complex mapping, including nesteds
	inputMap['representative/firstName'] = 'nombre';
	inputMap['representative/lastName'] = 'representante/secondoNombre';
	theirData.nombre = 'Marry';
	theirData.representante = { secondoNombre: 'Poppins' };
	expectedResult.request.data.representative = { firstName: 'Marry' };
	expectedResult.request.data.representative.lastName = 'Poppins';
	a.deep(t(bp, inputMap, { theirData: theirData }), expectedResult);
	// Nested within nested
	inputMap['representative/address/street'] = 'calle';
	theirData.calle = 'Cherry Lane';
	expectedResult.request.data.representative.address = { street: 'Cherry Lane' };
	a.deep(t(bp, inputMap, { theirData: theirData }), expectedResult);
	// Nested map
	inputMap['statusLog/*'] = 'mensajos';
	inputMap['statusLog/*/text'] = 'mensajeTxt';
	inputMap['statusLog/*/label'] = 'mensajeLabel';
	console.log('OWNER KEY...............', bp.statusLog.ordered.first.key);
	theirData.mansajos = [
		{ id: bp.statusLog.ordered.first.key, mensajeTxt: 'Datos recibidos', 'mensajeLabel': 'Primer' },
		{ id: bp.statusLog.ordered.last.key, mensajeTxt: 'Datos processados', 'mensajeLabel': 'Secondo' }
	];

	expectedResult.request.data.statusLog = [
		{ id: bp.statusLog.ordered.first.key, text: 'Datos recibidos', label: 'Primer' },
		{ id: bp.statusLog.ordered.last.key, text: 'Datos processados', label: 'Secondo' },
	];

	a.deep(JSON.stringify(t(bp, inputMap, { theirData: theirData }).request.data.statusLog), JSON.stringify(expectedResult.request.data.statusLog));

	/*************** END RECEIVING *****************/
};
