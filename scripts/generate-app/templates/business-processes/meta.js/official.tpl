// Meta data for business processes states applicable for this app

'use strict';

var forEach = require('es5-ext/object/for-each')
  , d       = require('d')
  , _       = require('../../../i18n')

  , meta;

module.exports = meta = Object.defineProperties({
	all: {
		label: _("All"),
		order: 5
	},
	pending: {
		label: _("Pending"),
		order: 1,
		default: true
	},
	approved: {
		label: _("Approved"),
		order: 2
	},
	rejected: {
		label: _("Rejected"),
		order: 3
	},
	sentBack: {
		label: _("Sent for corrections"),
		order: 4
	}
}, { _services: d(['TODO: Provide service names']) });

forEach(meta, function (conf, name) {
	if (name === 'all') {
		conf.indexName = 'processingSteps/map/${ appNameSuffix }/isReady';
		conf.indexValue = true;
	} else {
		conf.indexName = 'processingSteps/map/${ appNameSuffix }/status';
		conf.indexValue = name;
	}
});
