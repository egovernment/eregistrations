'use strict';

var Database          = require('dbjs')
  , defineFormSection = require('../../../model/form-section');

module.exports = function (t, a) {
	var db                   = new Database()
	  , FormSection          = defineFormSection(db)
	  , PropertyGroupProcess = t(db)

	  , process              = new PropertyGroupProcess();

	process.map._descriptorPrototype_.type = FormSection;
	process.define('applicable', { type: FormSection });

	a(process.progress, 1);
	a(process.weight, 0);

	process.map.define('test', { nested: true });
	a(process.progress, 1);
	a(process.weight, 0);
};
