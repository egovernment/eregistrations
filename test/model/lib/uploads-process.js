'use strict';

var aFrom             = require('es5-ext/array/from')
  , Database          = require('dbjs')
  , defineFormSection = require('../../../model/form-section');

module.exports = function (t, a) {
	var db = new Database()
	  , FormSection = defineFormSection(db)
	  , UploadsProcess = t(db)

	  , process = new UploadsProcess();

	a(process.progress, 1);
	a.deep(aFrom(process.applicable), []);
	a.deep(aFrom(process.uploaded), []);
	a.deep(aFrom(process.approved), []);
	a.deep(aFrom(process.rejected), []);
	a(process.approvalProgress, 1);

	process.map.define('test', { nested: true });
	process.map.test.isApplicable = true;
	process.map.test.document.define('dataForm', { type: FormSection });
	a(process.progress, 0);
	a.deep(aFrom(process.applicable), [process.map.test]);
	a.deep(aFrom(process.uploaded), []);
	a.deep(aFrom(process.approved), []);
	a.deep(aFrom(process.rejected), []);
	a(process.approvalProgress, 0);

	process.map.test.document.files.map.newUniq().path = '/elo.png';
	a(process.progress, 1);
	a.deep(aFrom(process.applicable), [process.map.test]);
	a.deep(aFrom(process.uploaded), [process.map.test]);
	a.deep(aFrom(process.approved), []);
	a.deep(aFrom(process.rejected), []);
	a(process.approvalProgress, 0);

	process.map.test.status = 'valid';
	a(process.progress, 1);
	a.deep(aFrom(process.applicable), [process.map.test]);
	a.deep(aFrom(process.uploaded), [process.map.test]);
	a.deep(aFrom(process.approved), [process.map.test]);
	a.deep(aFrom(process.rejected), []);
	a(process.approvalProgress, 1);

	process.map.test.status = 'invalid';
	process.map.test.rejectReasonTypes.add('illegible');
	a(process.progress, 1);
	a.deep(aFrom(process.applicable), [process.map.test]);
	a.deep(aFrom(process.uploaded), [process.map.test]);
	a.deep(aFrom(process.approved), []);
	a.deep(aFrom(process.rejected), [process.map.test]);
	a(process.approvalProgress, 0);
};
