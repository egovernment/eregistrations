// Meta data for business processes states applicable for this app

'use strict';

var _       = require('mano').i18n.bind('Official')
  , db      = require('mano').db
  , forEach = require('es5-ext/object/for-each')
  , meta;

if (!db.BusinessProcess) {
	require('../model/business-process-new')(db);
}

module.exports = meta = {
	'': {
		label: _("All"),
		default: true
	}
};

db.BusinessProcess.extensions.forEach(function (BusinessProcess) {
	BusinessProcess.prototype.processingSteps.map.forEach(function self(step) {
		if (db.ProcessingStepGroup && (step instanceof db.ProcessingStepGroup)) {
			step.steps.map.forEach(self);
			return;
		}
		meta[step.shortPath] = { label: step.label };
	});
});

forEach(meta, function (conf, name) {
	if (name === '') return;
	conf.indexName = 'processingSteps/map/' + name + '/resolvedStatus';
	conf.indexValue = 'pending';
});
